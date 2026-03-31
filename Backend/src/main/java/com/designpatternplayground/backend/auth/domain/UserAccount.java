package com.designpatternplayground.backend.auth.domain;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "user_accounts")
public class UserAccount {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, unique = true, length = 40)
	private String username;

	@Column(nullable = false, length = 256)
	private String passwordHash;

	@Column(nullable = false, length = 128)
	private String passwordSalt;

	@Column(nullable = false)
	private LocalDateTime createdAt;

	protected UserAccount() {
	}

	public UserAccount(
		String username,
		String passwordHash,
		String passwordSalt,
		LocalDateTime createdAt
	) {
		this.username = username;
		this.passwordHash = passwordHash;
		this.passwordSalt = passwordSalt;
		this.createdAt = createdAt;
	}

	public Long getId() {
		return id;
	}

	public String getUsername() {
		return username;
	}

	public String getPasswordHash() {
		return passwordHash;
	}

	public String getPasswordSalt() {
		return passwordSalt;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}
}
