package com.designpatternplayground.backend.auth.web;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

import jakarta.servlet.http.Cookie;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerTest {

	@Autowired
	private MockMvc mockMvc;

	@Test
	void shouldRegisterAndReturnAuthenticatedUser() throws Exception {
		MvcResult registerResult = mockMvc.perform(post("/api/auth/register")
			.contentType(MediaType.APPLICATION_JSON)
			.content("""
				{
				  "username": "alice_demo",
				  "password": "secret123"
				}
				"""))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.user.username").value("alice_demo"))
			.andReturn();

		Cookie accessCookie = cookie("dpp_access_token", extractCookieValue(registerResult, "dpp_access_token"));

		mockMvc.perform(get("/api/auth/me")
			.cookie(accessCookie))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.username").value("alice_demo"));
	}

	@Test
	void shouldLoginExistingUser() throws Exception {
		mockMvc.perform(post("/api/auth/register")
			.contentType(MediaType.APPLICATION_JSON)
			.content("""
				{
				  "username": "bob_demo",
				  "password": "secret123"
				}
				"""))
			.andExpect(status().isOk());

		mockMvc.perform(post("/api/auth/login")
			.contentType(MediaType.APPLICATION_JSON)
			.content("""
				{
				  "username": "bob_demo",
				  "password": "secret123"
				}
				"""))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.user.username").value("bob_demo"));
	}

	@Test
	void shouldRejectProtectedRouteWithoutCookie() throws Exception {
		mockMvc.perform(get("/api/auth/me"))
			.andExpect(status().isUnauthorized());
	}

	@Test
	void shouldLogoutAndInvalidateRefreshCookie() throws Exception {
		MvcResult registerResult = mockMvc.perform(post("/api/auth/register")
			.contentType(MediaType.APPLICATION_JSON)
			.content("""
				{
				  "username": "charlie_demo",
				  "password": "secret123"
				}
				"""))
			.andExpect(status().isOk())
			.andReturn();

		Cookie accessCookie = cookie("dpp_access_token", extractCookieValue(registerResult, "dpp_access_token"));
		Cookie refreshCookie = cookie("dpp_refresh_token", extractCookieValue(registerResult, "dpp_refresh_token"));

		mockMvc.perform(post("/api/auth/logout")
			.cookie(accessCookie, refreshCookie))
			.andExpect(status().isNoContent());

		mockMvc.perform(post("/api/auth/refresh")
			.cookie(refreshCookie))
			.andExpect(status().isUnauthorized());
	}

	@Test
	void shouldRefreshCookiesAndRotateRefreshCookie() throws Exception {
		MvcResult registerResult = mockMvc.perform(post("/api/auth/register")
			.contentType(MediaType.APPLICATION_JSON)
			.content("""
				{
				  "username": "diane_demo",
				  "password": "secret123"
				}
				"""))
			.andExpect(status().isOk())
			.andReturn();

		Cookie initialRefreshCookie = cookie("dpp_refresh_token", extractCookieValue(registerResult, "dpp_refresh_token"));

		MvcResult refreshResult = mockMvc.perform(post("/api/auth/refresh")
			.cookie(initialRefreshCookie))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.user.username").value("diane_demo"))
			.andReturn();

		Cookie rotatedAccessCookie = cookie("dpp_access_token", extractCookieValue(refreshResult, "dpp_access_token"));
		Cookie rotatedRefreshCookie = cookie("dpp_refresh_token", extractCookieValue(refreshResult, "dpp_refresh_token"));

		mockMvc.perform(post("/api/auth/refresh")
			.cookie(initialRefreshCookie))
			.andExpect(status().isUnauthorized());

		mockMvc.perform(get("/api/auth/me")
			.cookie(rotatedAccessCookie))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.username").value("diane_demo"));

		mockMvc.perform(post("/api/auth/refresh")
			.cookie(rotatedRefreshCookie))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.user.username").value("diane_demo"));
	}

	private Cookie cookie(String name, String value) {
		Cookie cookie = new Cookie(name, value);
		cookie.setPath("/");
		return cookie;
	}

	private String extractCookieValue(MvcResult result, String cookieName) {
		List<String> setCookieHeaders = result.getResponse().getHeaders(HttpHeaders.SET_COOKIE);

		for (String header : setCookieHeaders) {
			String prefix = cookieName + "=";
			if (header.startsWith(prefix)) {
				int valueEnd = header.indexOf(';');
				return valueEnd >= 0
					? header.substring(prefix.length(), valueEnd)
					: header.substring(prefix.length());
			}
		}

		throw new IllegalStateException("Cookie introuvable: " + cookieName);
	}
}
