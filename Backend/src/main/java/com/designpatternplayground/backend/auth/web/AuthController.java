package com.designpatternplayground.backend.auth.web;

import jakarta.validation.Valid;
import jakarta.servlet.http.HttpServletRequest;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.designpatternplayground.backend.auth.application.AuthSession;
import com.designpatternplayground.backend.auth.application.AuthService;
import com.designpatternplayground.backend.auth.security.AuthCookieService;
import com.designpatternplayground.backend.auth.security.AuthenticatedUser;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

	private final AuthService authService;
	private final AuthCookieService authCookieService;

	public AuthController(AuthService authService, AuthCookieService authCookieService) {
		this.authService = authService;
		this.authCookieService = authCookieService;
	}

	@PostMapping("/register")
	public ResponseEntity<AuthResponse> register(@Valid @RequestBody AuthRequest request) {
		return buildAuthenticatedResponse(authService.register(request.username(), request.password()));
	}

	@PostMapping("/login")
	public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
		return buildAuthenticatedResponse(authService.login(request.username(), request.password()));
	}

	@PostMapping("/refresh")
	public ResponseEntity<AuthResponse> refresh(HttpServletRequest request) {
		String refreshToken = authCookieService.extractRefreshToken(request);
		return buildAuthenticatedResponse(authService.refresh(refreshToken));
	}

	@PostMapping("/change-password")
	public ResponseEntity<AuthResponse> changePassword(
		@Valid @RequestBody ChangePasswordRequest request,
		Authentication authentication
	) {
		return buildAuthenticatedResponse(
			authService.changePassword(
				(AuthenticatedUser) authentication.getPrincipal(),
				request.currentPassword(),
				request.newPassword()
			)
		);
	}

	@GetMapping("/me")
	public AuthUserResponse me(Authentication authentication) {
		return authService.getCurrentUser((AuthenticatedUser) authentication.getPrincipal());
	}

	@PostMapping("/logout")
	public ResponseEntity<Void> logout(Authentication authentication, HttpServletRequest request) {
		String refreshToken = authCookieService.extractRefreshToken(request);
		AuthenticatedUser authenticatedUser = authentication != null
			? (AuthenticatedUser) authentication.getPrincipal()
			: null;
		authService.logout(authenticatedUser, refreshToken);

		HttpHeaders headers = new HttpHeaders();
		authCookieService.clearAuthenticationCookies(headers);
		return ResponseEntity.noContent().headers(headers).build();
	}

	private ResponseEntity<AuthResponse> buildAuthenticatedResponse(AuthSession session) {
		HttpHeaders headers = new HttpHeaders();
		authCookieService.addAuthenticationCookies(headers, session.accessToken(), session.refreshToken());
		return ResponseEntity.ok()
			.headers(headers)
			.body(new AuthResponse(session.user()));
	}
}
