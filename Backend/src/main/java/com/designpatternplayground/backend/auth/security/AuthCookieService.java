package com.designpatternplayground.backend.auth.security;

import java.time.Duration;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;

@Service
public class AuthCookieService {

	// Access tokens are scoped to /api, while refresh tokens are limited to /api/auth so the
	// browser sends the stronger credential only to authentication endpoints.
	private static final String ACCESS_TOKEN_PATH = "/api";
	private static final String REFRESH_TOKEN_PATH = "/api/auth";

	private final String accessTokenCookieName;
	private final String refreshTokenCookieName;
	private final boolean secureCookies;
	private final String sameSitePolicy;
	private final String cookieDomain;
	private final Duration accessTokenMaxAge;
	private final Duration refreshTokenMaxAge;

	public AuthCookieService(
		@Value("${app.security.cookies.access-token-name}") String accessTokenCookieName,
		@Value("${app.security.cookies.refresh-token-name}") String refreshTokenCookieName,
		@Value("${app.security.cookies.secure}") boolean secureCookies,
		@Value("${app.security.cookies.same-site}") String sameSitePolicy,
		@Value("${app.security.cookies.domain}") String cookieDomain,
		@Value("${app.security.jwt.access-token-expiration-minutes}") long accessTokenExpirationMinutes,
		@Value("${app.security.refresh-token.expiration-days}") long refreshTokenExpirationDays
	) {
		this.accessTokenCookieName = accessTokenCookieName;
		this.refreshTokenCookieName = refreshTokenCookieName;
		this.secureCookies = secureCookies;
		this.sameSitePolicy = sameSitePolicy;
		this.cookieDomain = cookieDomain;
		this.accessTokenMaxAge = Duration.ofMinutes(accessTokenExpirationMinutes);
		this.refreshTokenMaxAge = Duration.ofDays(refreshTokenExpirationDays);
	}

	public void addAuthenticationCookies(HttpHeaders headers, String accessToken, String refreshToken) {
		headers.add(HttpHeaders.SET_COOKIE, buildCookie(accessTokenCookieName, accessToken, ACCESS_TOKEN_PATH, accessTokenMaxAge).toString());
		headers.add(HttpHeaders.SET_COOKIE, buildCookie(refreshTokenCookieName, refreshToken, REFRESH_TOKEN_PATH, refreshTokenMaxAge).toString());
	}

	public void clearAuthenticationCookies(HttpHeaders headers) {
		headers.add(HttpHeaders.SET_COOKIE, buildCookie(accessTokenCookieName, "", ACCESS_TOKEN_PATH, Duration.ZERO).toString());
		headers.add(HttpHeaders.SET_COOKIE, buildCookie(refreshTokenCookieName, "", REFRESH_TOKEN_PATH, Duration.ZERO).toString());
	}

	public String extractAccessToken(HttpServletRequest request) {
		return extractCookie(request, accessTokenCookieName);
	}

	public String extractRefreshToken(HttpServletRequest request) {
		return extractCookie(request, refreshTokenCookieName);
	}

	private String extractCookie(HttpServletRequest request, String cookieName) {
		Cookie[] cookies = request.getCookies();
		if (cookies == null) {
			return null;
		}

		for (Cookie cookie : cookies) {
			if (cookieName.equals(cookie.getName())) {
				String value = cookie.getValue();
				return value == null || value.isBlank() ? null : value;
			}
		}

		return null;
	}

	private ResponseCookie buildCookie(String name, String value, String path, Duration maxAge) {
		// The same builder is reused for normal issuance and cookie clearing; maxAge=0 performs
		// the deletion while preserving the original cookie path and domain.
		ResponseCookie.ResponseCookieBuilder builder = ResponseCookie.from(name, value)
			.httpOnly(true)
			.secure(secureCookies)
			.path(path)
			.sameSite(sameSitePolicy)
			.maxAge(maxAge);

		if (!cookieDomain.isBlank()) {
			builder.domain(cookieDomain);
		}

		return builder.build();
	}
}
