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
	name = "user_pattern_progress",
	uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "pattern_code"})
)
public class UserPatternProgress {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "user_id", nullable = false)
	private UserAccount user;

	@Column(name = "pattern_code", nullable = false, length = 80)
	private String patternCode;

	@Column(nullable = false)
	private boolean demoCompleted;

	@Column(nullable = false)
	private boolean quizPassed;

	@Column(nullable = false)
	private boolean missionCompleted;

	@Column(nullable = false)
	private boolean advancedMissionCompleted;

	@Column(nullable = false)
	private int completionPercentage;

	@Column(nullable = false)
	private boolean mastered;

	private LocalDateTime masteredAt;

	private LocalDateTime lastUpdatedAt;

	protected UserPatternProgress() {
	}

	public UserPatternProgress(UserAccount user, String patternCode) {
		this.user = user;
		this.patternCode = patternCode;
	}

	public boolean markDemoCompleted(LocalDateTime updatedAt) {
		if (this.demoCompleted) {
			return false;
		}

		this.demoCompleted = true;
		recompute(updatedAt);
		return true;
	}

	public boolean markQuizPassed(LocalDateTime updatedAt) {
		if (this.quizPassed) {
			return false;
		}

		this.quizPassed = true;
		recompute(updatedAt);
		return true;
	}

	public boolean markMissionCompleted(boolean advanced, LocalDateTime updatedAt) {
		boolean changed = false;

		if (advanced) {
			if (!this.advancedMissionCompleted) {
				this.advancedMissionCompleted = true;
				changed = true;
			}
		} else if (!this.missionCompleted) {
			this.missionCompleted = true;
			changed = true;
		}

		if (changed) {
			recompute(updatedAt);
		}

		return changed;
	}

	private void recompute(LocalDateTime updatedAt) {
		this.completionPercentage = (demoCompleted ? 20 : 0)
			+ (quizPassed ? 30 : 0)
			+ (missionCompleted ? 30 : 0)
			+ (advancedMissionCompleted ? 20 : 0);
		this.mastered = this.completionPercentage >= 100;
		if (this.mastered && this.masteredAt == null) {
			this.masteredAt = updatedAt;
		}
		this.lastUpdatedAt = updatedAt;
	}

	public String getPatternCode() {
		return patternCode;
	}

	public boolean isDemoCompleted() {
		return demoCompleted;
	}

	public boolean isQuizPassed() {
		return quizPassed;
	}

	public boolean isMissionCompleted() {
		return missionCompleted;
	}

	public boolean isAdvancedMissionCompleted() {
		return advancedMissionCompleted;
	}

	public int getCompletionPercentage() {
		return completionPercentage;
	}

	public boolean isMastered() {
		return mastered;
	}

	public LocalDateTime getMasteredAt() {
		return masteredAt;
	}

	public LocalDateTime getLastUpdatedAt() {
		return lastUpdatedAt;
	}
}
