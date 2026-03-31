package com.designpatternplayground.backend.auth.application;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Locale;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.designpatternplayground.backend.auth.domain.RefreshTokenSession;
import com.designpatternplayground.backend.auth.domain.RefreshTokenSessionRepository;
import com.designpatternplayground.backend.auth.domain.UserAccount;
import com.designpatternplayground.backend.auth.domain.UserAccountRepository;
import com.designpatternplayground.backend.auth.security.AuthenticatedUser;
import com.designpatternplayground.backend.auth.security.JwtService;
import com.designpatternplayground.backend.auth.web.AuthUserResponse;
import com.designpatternplayground.backend.common.exception.AuthenticationFailedException;
import com.designpatternplayground.backend.common.exception.UsernameAlreadyExistsException;

@Service
public class AuthService {

	private static final int REFRESH_TOKEN_SIZE = 48;

	private final UserAccountRepository userAccountRepository;
	private final RefreshTokenSessionRepository refreshTokenSessionRepository;
	private final AuthPasswordHasher passwordHasher;
	private final JwtService jwtService;
	private final Duration refreshTokenExpiration;
	private final SecureRandom secureRandom;

	public AuthService(
		UserAccountRepository userAccountRepository,
		RefreshTokenSessionRepository refreshTokenSessionRepository,
		AuthPasswordHasher passwordHasher,
		JwtService jwtService,
		@Value("${app.security.refresh-token.expiration-days}") long refreshTokenExpirationDays
	) {
		this.userAccountRepository = userAccountRepository;
		this.refreshTokenSessionRepository = refreshTokenSessionRepository;
		this.passwordHasher = passwordHasher;
		this.jwtService = jwtService;
		this.refreshTokenExpiration = Duration.ofDays(refreshTokenExpirationDays);
		this.secureRandom = new SecureRandom();
	}

	@Transactional
	public AuthSession register(String username, String password) {
		String normalizedUsername = normalizeUsername(username);
		validatePassword(password);

		if (userAccountRepository.existsByUsernameIgnoreCase(normalizedUsername)) {
			throw new UsernameAlreadyExistsException(normalizedUsername);
		}

		String salt = passwordHasher.generateSalt();
		UserAccount user = userAccountRepository.save(new UserAccount(
			normalizedUsername,
			passwordHasher.hashPassword(password, salt),
			salt,
			LocalDateTime.now()
		));

		return createAuthResponse(user);
	}

	@Transactional
	public AuthSession login(String username, String password) {
		String normalizedUsername = normalizeUsername(username);
		UserAccount user = userAccountRepository.findByUsernameIgnoreCase(normalizedUsername)
			.orElseThrow(() -> new AuthenticationFailedException("Pseudo ou mot de passe invalide."));

		if (!passwordHasher.matches(password, user.getPasswordSalt(), user.getPasswordHash())) {
			throw new AuthenticationFailedException("Pseudo ou mot de passe invalide.");
		}

		return createAuthResponse(user);
	}

	@Transactional
	public AuthUserResponse getCurrentUser(AuthenticatedUser authenticatedUser) {
		UserAccount user = userAccountRepository.findById(authenticatedUser.id())
			.orElseThrow(() -> new AuthenticationFailedException("Utilisateur introuvable."));
		return toUserResponse(user);
	}

	@Transactional
	public AuthSession refresh(String refreshToken) {
		LocalDateTime now = LocalDateTime.now();
		RefreshTokenSession session = refreshTokenSessionRepository.findByToken(normalizeRefreshToken(refreshToken))
			.orElseThrow(() -> new AuthenticationFailedException("Refresh token invalide."));

		if (session.isExpired(now)) {
			refreshTokenSessionRepository.deleteByToken(session.getToken());
			throw new AuthenticationFailedException("Le refresh token a expire.");
		}

		UserAccount user = session.getUser();
		refreshTokenSessionRepository.deleteByToken(session.getToken());
		return createAuthResponse(user);
	}

	@Transactional
	public void logout(AuthenticatedUser authenticatedUser, String refreshToken) {
		if (refreshToken == null || refreshToken.isBlank()) {
			if (authenticatedUser == null) {
				throw new AuthenticationFailedException("Authentification requise.");
			}

			refreshTokenSessionRepository.deleteByUser_Id(authenticatedUser.id());
			return;
		}

		long deletedCount = refreshTokenSessionRepository.deleteByToken(refreshToken.trim());
		if (deletedCount == 0L && authenticatedUser != null) {
			refreshTokenSessionRepository.deleteByUser_Id(authenticatedUser.id());
		}
	}

	private AuthSession createAuthResponse(UserAccount user) {
		LocalDateTime now = LocalDateTime.now();
		refreshTokenSessionRepository.deleteByExpiresAtBefore(now);

		RefreshTokenSession refreshTokenSession = refreshTokenSessionRepository.save(new RefreshTokenSession(
			generateRefreshTokenValue(),
			user,
			now,
			now.plus(refreshTokenExpiration)
		));

		return new AuthSession(
			jwtService.generateToken(user),
			refreshTokenSession.getToken(),
			toUserResponse(user)
		);
	}

	private String normalizeUsername(String username) {
		if (username == null) {
			throw new IllegalArgumentException("Le pseudo est obligatoire.");
		}

		String normalized = username.trim().toLowerCase(Locale.ROOT);
		if (normalized.length() < 3 || normalized.length() > 20) {
			throw new IllegalArgumentException("Le pseudo doit contenir entre 3 et 20 caracteres.");
		}

		if (!normalized.matches("[a-z0-9._-]+")) {
			throw new IllegalArgumentException("Le pseudo ne peut contenir que lettres, chiffres, point, underscore et tiret.");
		}

		return normalized;
	}

	private void validatePassword(String password) {
		if (password == null || password.length() < 6 || password.length() > 120) {
			throw new IllegalArgumentException("Le mot de passe doit contenir entre 6 et 120 caracteres.");
		}
	}

	private String normalizeRefreshToken(String refreshToken) {
		if (refreshToken == null || refreshToken.isBlank()) {
			throw new AuthenticationFailedException("Le refresh token est obligatoire.");
		}

		return refreshToken.trim();
	}

	private String generateRefreshTokenValue() {
		byte[] buffer = new byte[REFRESH_TOKEN_SIZE];
		secureRandom.nextBytes(buffer);
		return Base64.getUrlEncoder().withoutPadding().encodeToString(buffer);
	}

	private AuthUserResponse toUserResponse(UserAccount user) {
		return new AuthUserResponse(
			user.getId(),
			user.getUsername(),
			user.getCreatedAt()
		);
	}
}
