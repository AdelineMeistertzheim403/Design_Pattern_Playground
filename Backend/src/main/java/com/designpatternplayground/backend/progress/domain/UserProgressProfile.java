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
	name = "user_progress_profiles",
	uniqueConstraints = @UniqueConstraint(columnNames = {"user_id"})
)
public class UserProgressProfile {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "user_id", nullable = false)
	private UserAccount user;

	@Column(nullable = false)
	private int totalXp;

	@Column(nullable = false)
	private int demoCount;

	@Column(nullable = false)
	private int successfulQuizCount;

	@Column(nullable = false)
	private int perfectQuizCount;

	@Column(nullable = false)
	private int successfulMissionCount;

	@Column(nullable = false)
	private int successfulAdvancedMissionCount;

	@Column(nullable = false)
	private int multiPatternMissionSuccessCount;

	@Column(nullable = false)
	private int consecutiveSuccessCount;

	@Column(nullable = false)
	private int bestSuccessStreak;

	@Column(nullable = false)
	private int currentHardMissionSuccessStreak;

	@Column(nullable = false)
	private int bestHardMissionSuccessStreak;

	private LocalDateTime lastXpAwardedAt;

	protected UserProgressProfile() {
	}

	public UserProgressProfile(UserAccount user) {
		this.user = user;
	}

	public void awardXp(int xp, LocalDateTime awardedAt) {
		if (xp <= 0) {
			return;
		}

		this.totalXp += xp;
		this.lastXpAwardedAt = awardedAt;
	}

	public void recordDemoCompletion() {
		this.demoCount += 1;
	}

	public void recordQuizSuccess(boolean perfect) {
		this.successfulQuizCount += 1;
		if (perfect) {
			this.perfectQuizCount += 1;
		}
	}

	public void recordMissionSuccess(boolean advanced, boolean multiPattern) {
		this.successfulMissionCount += 1;
		if (advanced) {
			this.successfulAdvancedMissionCount += 1;
		}
		if (multiPattern) {
			this.multiPatternMissionSuccessCount += 1;
		}
	}

	public void recordSuccess() {
		this.consecutiveSuccessCount += 1;
		if (this.consecutiveSuccessCount > this.bestSuccessStreak) {
			this.bestSuccessStreak = this.consecutiveSuccessCount;
		}
	}

	public void resetSuccessStreak() {
		this.consecutiveSuccessCount = 0;
	}

	public void recordHardMissionSuccess() {
		this.currentHardMissionSuccessStreak += 1;
		if (this.currentHardMissionSuccessStreak > this.bestHardMissionSuccessStreak) {
			this.bestHardMissionSuccessStreak = this.currentHardMissionSuccessStreak;
		}
	}

	public void resetHardMissionSuccessStreak() {
		this.currentHardMissionSuccessStreak = 0;
	}

	public Long getUserId() {
		return user.getId();
	}

	public int getTotalXp() {
		return totalXp;
	}

	public int getDemoCount() {
		return demoCount;
	}

	public int getSuccessfulQuizCount() {
		return successfulQuizCount;
	}

	public int getPerfectQuizCount() {
		return perfectQuizCount;
	}

	public int getSuccessfulMissionCount() {
		return successfulMissionCount;
	}

	public int getSuccessfulAdvancedMissionCount() {
		return successfulAdvancedMissionCount;
	}

	public int getMultiPatternMissionSuccessCount() {
		return multiPatternMissionSuccessCount;
	}

	public int getConsecutiveSuccessCount() {
		return consecutiveSuccessCount;
	}

	public int getBestSuccessStreak() {
		return bestSuccessStreak;
	}

	public int getCurrentHardMissionSuccessStreak() {
		return currentHardMissionSuccessStreak;
	}

	public int getBestHardMissionSuccessStreak() {
		return bestHardMissionSuccessStreak;
	}

	public LocalDateTime getLastXpAwardedAt() {
		return lastXpAwardedAt;
	}
}
