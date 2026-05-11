package com.designpatternplayground.backend.auth.security;

import java.io.IOException;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.designpatternplayground.backend.common.exception.AuthenticationFailedException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

	private final JwtService jwtService;
	private final AuthCookieService authCookieService;

	public JwtAuthenticationFilter(
		JwtService jwtService,
		AuthCookieService authCookieService
	) {
		this.jwtService = jwtService;
		this.authCookieService = authCookieService;
	}

	@Override
	protected void doFilterInternal(
		HttpServletRequest request,
		HttpServletResponse response,
		FilterChain filterChain
	) throws ServletException, IOException {
		String token = resolveToken(request);
		if (token == null) {
			filterChain.doFilter(request, response);
			return;
		}

		try {
			AuthenticatedUser user = jwtService.parseToken(token);

			UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
				user,
				null,
				user.authorities()
			);
			authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

			SecurityContextHolder.getContext().setAuthentication(authentication);
			filterChain.doFilter(request, response);
		} catch (AuthenticationFailedException exception) {
			// Invalid access tokens do not short-circuit the chain. Public endpoints still work,
			// and protected endpoints will fail later through the standard entry point.
			SecurityContextHolder.clearContext();
			filterChain.doFilter(request, response);
		}
	}

	private String resolveToken(HttpServletRequest request) {
		// Authorization header is checked first for tooling and tests; the SPA normally relies
		// on HttpOnly cookies in browser traffic.
		String authorizationHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
		if (authorizationHeader != null && !authorizationHeader.isBlank()) {
			return extractBearerToken(authorizationHeader);
		}

		return authCookieService.extractAccessToken(request);
	}

	private String extractBearerToken(String authorizationHeader) {
		String prefix = "Bearer ";
		if (!authorizationHeader.startsWith(prefix)) {
			throw new AuthenticationFailedException("Format Authorization invalide.");
		}

		String token = authorizationHeader.substring(prefix.length()).trim();
		if (token.isEmpty()) {
			throw new AuthenticationFailedException("JWT manquant.");
		}

		return token;
	}
}
