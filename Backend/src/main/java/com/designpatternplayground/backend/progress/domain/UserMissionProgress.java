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
	name = "user_mission_progress",
	uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "mission_id"})
)
public class UserMissionProgress {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "user_id", nullable = false)
	private UserAccount user;

	@Column(name = "mission_id", nullable = false, length = 120)
	private String missionId;

	@Column(nullable = false)
	private int attemptsCount;

	@Column(nullable = false)
	private int successCount;

	@Column(nullable = false)
	private int bestScore;

	@Column(nullable = false)
	private int consecutiveFailures;

	@Column(nullable = false)
	private int lastDurationSeconds;

	private LocalDateTime firstSuccessAt;

	private LocalDateTime lastSuccessAt;

	private LocalDateTime lastAttemptAt;

	protected UserMissionProgress() {
	}

	public UserMissionProgress(UserAccount user, String missionId) {
		this.user = user;
		this.missionId = missionId;
	}

	public boolean recordAttempt(boolean success, int score, int durationSeconds, LocalDateTime attemptedAt) {
		this.attemptsCount += 1;
		this.lastAttemptAt = attemptedAt;
		this.lastDurationSeconds = Math.max(0, durationSeconds);
		if (score > this.bestScore) {
			this.bestScore = score;
		}

		if (!success) {
			this.consecutiveFailures += 1;
			return false;
		}

		boolean firstSuccess = this.successCount == 0;
		this.successCount += 1;
		this.lastSuccessAt = attemptedAt;
		if (this.firstSuccessAt == null) {
			this.firstSuccessAt = attemptedAt;
		}
		this.consecutiveFailures = 0;
		return firstSuccess;
	}

	public int getAttemptsCount() {
		return attemptsCount;
	}

	public int getSuccessCount() {
		return successCount;
	}

	public int getBestScore() {
		return bestScore;
	}

	public int getConsecutiveFailures() {
		return consecutiveFailures;
	}

	public String getMissionId() {
		return missionId;
	}

	public LocalDateTime getLastSuccessAt() {
		return lastSuccessAt;
	}

	public LocalDateTime getLastAttemptAt() {
		return lastAttemptAt;
	}
}
