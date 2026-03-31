package com.designpatternplayground.backend.auth.application;

import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.security.spec.InvalidKeySpecException;
import java.util.Base64;

import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;

import org.springframework.stereotype.Component;

@Component
public class AuthPasswordHasher {

	private static final int ITERATIONS = 120000;
	private static final int KEY_LENGTH = 256;
	private static final int SALT_LENGTH = 16;

	public String generateSalt() {
		byte[] salt = new byte[SALT_LENGTH];
		new SecureRandom().nextBytes(salt);
		return Base64.getEncoder().encodeToString(salt);
	}

	public String hashPassword(String password, String salt) {
		try {
			PBEKeySpec spec = new PBEKeySpec(
				password.toCharArray(),
				Base64.getDecoder().decode(salt),
				ITERATIONS,
				KEY_LENGTH
			);

			SecretKeyFactory secretKeyFactory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256");
			byte[] hash = secretKeyFactory.generateSecret(spec).getEncoded();
			return Base64.getEncoder().encodeToString(hash);
		} catch (NoSuchAlgorithmException | InvalidKeySpecException exception) {
			throw new IllegalStateException("Impossible de hacher le mot de passe.", exception);
		}
	}

	public boolean matches(String rawPassword, String salt, String expectedHash) {
		String candidateHash = hashPassword(rawPassword, salt);
		return candidateHash.equals(expectedHash);
	}
}
