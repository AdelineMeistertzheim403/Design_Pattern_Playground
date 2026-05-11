package com.designpatternplayground.backend.auth.security;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.designpatternplayground.backend.auth.domain.UserAccount;
import com.designpatternplayground.backend.auth.domain.UserRole;
import com.designpatternplayground.backend.common.exception.AuthenticationFailedException;

@Service
public class JwtService {

	private final byte[] secret;
	private final Duration expiration;

	public JwtService(
		@Value("${app.security.jwt.secret}") String secret,
		@Value("${app.security.jwt.access-token-expiration-minutes}") long expirationMinutes
	) {
		this.secret = secret.getBytes(StandardCharsets.UTF_8);
		this.expiration = Duration.ofMinutes(expirationMinutes);

		if (this.secret.length < 32) {
			throw new IllegalStateException("La cle JWT doit contenir au moins 32 octets.");
		}
	}

	public String generateToken(UserAccount user) {
		try {
			Instant issuedAt = Instant.now();
			Instant expiresAt = issuedAt.plus(expiration);

			// The project keeps JWT handling explicit instead of pulling a full JWT library:
			// header + payload JSON, Base64URL encoding, then HMAC-SHA256 signature.
			String header = encode("""
				{"alg":"HS256","typ":"JWT"}
				""".trim());
			String body = encode(buildPayload(user, issuedAt, expiresAt));
			String signature = sign(header + "." + body);

			return header + "." + body + "." + signature;
		} catch (AuthenticationFailedException exception) {
			throw exception;
		} catch (Exception exception) {
			throw new IllegalStateException("Impossible de generer le JWT.", exception);
		}
	}

	public AuthenticatedUser parseToken(String token) {
		try {
			String[] parts = token.split("\\.");
			if (parts.length != 3) {
				throw new AuthenticationFailedException("Token JWT invalide.");
			}

			String signedContent = parts[0] + "." + parts[1];
			String expectedSignature = sign(signedContent);
			if (!constantTimeEquals(expectedSignature, parts[2])) {
				throw new AuthenticationFailedException("Signature JWT invalide.");
			}

			String claims = decode(parts[1]);
			String username = extractStringClaim(claims, "sub");
			Long userId = extractLongClaim(claims, "uid");
			Long expiresAt = extractLongClaim(claims, "exp");
			String role = extractStringClaim(claims, "role");
			Boolean forcePasswordChange = extractBooleanClaim(claims, "fpw");

			if (username == null || username.isBlank() || userId == null || expiresAt == null) {
				throw new AuthenticationFailedException("Claims JWT invalides.");
			}

			if (Instant.now().getEpochSecond() >= expiresAt) {
				throw new AuthenticationFailedException("Le JWT a expire.");
			}

			// The token embeds role and password-change state so authorization checks can run
			// without hitting the database on every request.
			String normalizedRole = role == null || role.isBlank() ? UserRole.USER.name() : role;
			return new AuthenticatedUser(userId, username, normalizedRole, Boolean.TRUE.equals(forcePasswordChange));
		} catch (AuthenticationFailedException exception) {
			throw exception;
		} catch (Exception exception) {
			throw new AuthenticationFailedException("Token JWT invalide.");
		}
	}

	private String encode(String content) {
		return Base64.getUrlEncoder()
			.withoutPadding()
			.encodeToString(content.getBytes(StandardCharsets.UTF_8));
	}

	private String decode(String value) {
		byte[] decoded = Base64.getUrlDecoder().decode(value);
		return new String(decoded, StandardCharsets.UTF_8);
	}

	private String sign(String value) throws Exception {
		Mac mac = Mac.getInstance("HmacSHA256");
		mac.init(new SecretKeySpec(secret, "HmacSHA256"));
		byte[] signature = mac.doFinal(value.getBytes(StandardCharsets.UTF_8));
		return Base64.getUrlEncoder().withoutPadding().encodeToString(signature);
	}

	private boolean constantTimeEquals(String left, String right) {
		byte[] leftBytes = left.getBytes(StandardCharsets.UTF_8);
		byte[] rightBytes = right.getBytes(StandardCharsets.UTF_8);
		return java.security.MessageDigest.isEqual(leftBytes, rightBytes);
	}

	private String buildPayload(UserAccount user, Instant issuedAt, Instant expiresAt) {
		return "{"
			+ "\"sub\":\"" + escape(user.getUsername()) + "\","
			+ "\"uid\":" + user.getId() + ","
			+ "\"role\":\"" + escape(user.getRole().name()) + "\","
			+ "\"fpw\":" + user.isForcePasswordChange() + ","
			+ "\"iat\":" + issuedAt.getEpochSecond() + ","
			+ "\"exp\":" + expiresAt.getEpochSecond()
			+ "}";
	}

	private String extractStringClaim(String json, String claimName) {
		String pattern = "\"" + claimName + "\":\"";
		int start = json.indexOf(pattern);
		if (start < 0) {
			return null;
		}

		int valueStart = start + pattern.length();
		int valueEnd = json.indexOf('"', valueStart);
		if (valueEnd < 0) {
			return null;
		}

		return json.substring(valueStart, valueEnd)
			.replace("\\\"", "\"")
			.replace("\\\\", "\\");
	}

	private Long extractLongClaim(String json, String claimName) {
		String pattern = "\"" + claimName + "\":";
		int start = json.indexOf(pattern);
		if (start < 0) {
			return null;
		}

		int valueStart = start + pattern.length();
		int valueEnd = valueStart;
		while (valueEnd < json.length() && Character.isDigit(json.charAt(valueEnd))) {
			valueEnd++;
		}
		if (valueEnd == valueStart) {
			return null;
		}

		return Long.parseLong(json.substring(valueStart, valueEnd));
	}

	private Boolean extractBooleanClaim(String json, String claimName) {
		String pattern = "\"" + claimName + "\":";
		int start = json.indexOf(pattern);
		if (start < 0) {
			return null;
		}

		int valueStart = start + pattern.length();
		if (json.startsWith("true", valueStart)) {
			return true;
		}
		if (json.startsWith("false", valueStart)) {
			return false;
		}
		return null;
	}

	private String escape(String value) {
		return value
			.replace("\\", "\\\\")
			.replace("\"", "\\\"");
	}
}
