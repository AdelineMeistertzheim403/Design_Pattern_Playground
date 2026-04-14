package com.designpatternplayground.backend.progress.domain;

import java.time.LocalDateTime;

import com.designpatternplayground.backend.auth.domain.UserAccount;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
	name = "user_badge_unlocks",
	uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "badge_code"})
)
public class UserBadgeUnlock {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "user_id", nullable = false)
	private UserAccount user;

	@Column(name = "badge_code", nullable = false, length = 80)
	private String badgeCode;

	@Column(nullable = false)
	private LocalDateTime unlockedAt;

	protected UserBadgeUnlock() {
	}

	public UserBadgeUnlock(UserAccount user, String badgeCode, LocalDateTime unlockedAt) {
		this.user = user;
		this.badgeCode = badgeCode;
		this.unlockedAt = unlockedAt;
	}

	public String getBadgeCode() {
		return badgeCode;
	}

	public LocalDateTime getUnlockedAt() {
		return unlockedAt;
	}
}
