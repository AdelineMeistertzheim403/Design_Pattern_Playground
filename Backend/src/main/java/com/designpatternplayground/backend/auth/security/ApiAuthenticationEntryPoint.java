package com.designpatternplayground.backend.auth.security;

import java.io.IOException;
import java.time.LocalDateTime;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

@Component
public class ApiAuthenticationEntryPoint implements AuthenticationEntryPoint {

	@Override
	public void commence(
		HttpServletRequest request,
		HttpServletResponse response,
		AuthenticationException authException
	) throws IOException {
		response.setStatus(HttpStatus.UNAUTHORIZED.value());
		response.setContentType(MediaType.APPLICATION_JSON_VALUE);
		response.getWriter().write(buildErrorBody(request, authException));
	}

	private String buildErrorBody(
		HttpServletRequest request,
		AuthenticationException authException
	) {
		return "{"
			+ "\"timestamp\":\"" + LocalDateTime.now() + "\","
			+ "\"status\":" + HttpStatus.UNAUTHORIZED.value() + ","
			+ "\"error\":\"" + HttpStatus.UNAUTHORIZED.getReasonPhrase() + "\","
			+ "\"message\":\"" + escape(authException.getMessage()) + "\","
			+ "\"path\":\"" + escape(request.getRequestURI()) + "\""
			+ "}";
	}

	private String escape(String value) {
		if (value == null) {
			return "";
		}
		return value
			.replace("\\", "\\\\")
			.replace("\"", "\\\"");
	}
}
