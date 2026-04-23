package com.designpatternplayground.backend.auth.application;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import com.designpatternplayground.backend.auth.domain.UserAccount;
import com.designpatternplayground.backend.auth.domain.UserAccountRepository;
import com.designpatternplayground.backend.auth.domain.UserRole;

@Component
public class AdminBootstrapService {

	private final UserAccountRepository userAccountRepository;
	private final AuthPasswordHasher passwordHasher;
	private final String bootstrapUsername;
	private final String bootstrapPassword;

	public AdminBootstrapService(
		UserAccountRepository userAccountRepository,
		AuthPasswordHasher passwordHasher,
		@Value("${app.security.bootstrap-admin.username:}") String bootstrapUsername,
		@Value("${app.security.bootstrap-admin.password:}") String bootstrapPassword
	) {
		this.userAccountRepository = userAccountRepository;
		this.passwordHasher = passwordHasher;
		this.bootstrapUsername = bootstrapUsername == null ? "" : bootstrapUsername.trim().toLowerCase();
		this.bootstrapPassword = bootstrapPassword == null ? "" : bootstrapPassword;
	}

	@org.springframework.context.annotation.Bean
	ApplicationRunner bootstrapAdminAccount() {
		return (arguments) -> {
			if (bootstrapUsername.isBlank() || bootstrapPassword.isBlank()) {
				return;
			}

			UserAccount existingUser = userAccountRepository.findByUsernameIgnoreCase(bootstrapUsername).orElse(null);
			if (existingUser != null) {
				if (existingUser.getRole() != UserRole.ADMIN) {
					existingUser.setRole(UserRole.ADMIN);
				}
				existingUser.setForcePasswordChange(true);
				userAccountRepository.save(existingUser);
				return;
			}

			String salt = passwordHasher.generateSalt();
			userAccountRepository.save(new UserAccount(
				bootstrapUsername,
				passwordHasher.hashPassword(bootstrapPassword, salt),
				salt,
				LocalDateTime.now(),
				UserRole.ADMIN,
				true
			));
		};
	}
}
