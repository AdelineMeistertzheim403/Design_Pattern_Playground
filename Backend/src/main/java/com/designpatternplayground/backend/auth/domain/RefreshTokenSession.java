package com.designpatternplayground.backend.auth.domain;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "refresh_token_sessions")
public class RefreshTokenSession {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, unique = true, length = 160)
	private String token;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "user_id", nullable = false)
	private UserAccount user;

	@Column(nullable = false)
	private LocalDateTime createdAt;

	@Column(nullable = false)
	private LocalDateTime expiresAt;

	protected RefreshTokenSession() {
	}

	public RefreshTokenSession(
		String token,
		UserAccount user,
		LocalDateTime createdAt,
		LocalDateTime expiresAt
	) {
		this.token = token;
		this.user = user;
		this.createdAt = createdAt;
		this.expiresAt = expiresAt;
	}

	public Long getId() {
		return id;
	}

	public String getToken() {
		return token;
	}

	public UserAccount getUser() {
		return user;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public LocalDateTime getExpiresAt() {
		return expiresAt;
	}

	public boolean isExpired(LocalDateTime now) {
		return !expiresAt.isAfter(now);
	}
}
