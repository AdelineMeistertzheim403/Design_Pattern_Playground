package com.designpatternplayground.backend.quiz.domain;

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
	name = "user_quiz_progress",
	uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "pattern_code"})
)
public class UserQuizProgress {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "user_id", nullable = false)
	private UserAccount user;

	@Column(name = "pattern_code", nullable = false, length = 80)
	private String patternCode;

	@Column(nullable = false)
	private int attemptsCount;

	@Column(nullable = false)
	private int cumulativePoints;

	@Column(nullable = false)
	private int bestPoints;

	@Column(nullable = false)
	private int maxPoints;

	@Column(nullable = false)
	private int bestPointsPercent;

	@Column(nullable = false)
	private int bestCorrectAnswers;

	@Column(nullable = false)
	private int questionCount;

	@Column(nullable = false)
	private int bestCorrectPercent;

	@Column(nullable = false)
	private int lastPoints;

	@Column(nullable = false)
	private int lastPointsPercent;

	@Column(nullable = false)
	private int lastCorrectAnswers;

	@Column(nullable = false)
	private int lastCorrectPercent;

	@Column(nullable = false)
	private boolean badgeUnlocked;

	@Column(nullable = false, length = 80)
	private String badgeLabel;

	private LocalDateTime badgeUnlockedAt;

	private LocalDateTime lastAttemptAt;

	protected UserQuizProgress() {
	}

	public UserQuizProgress(
		UserAccount user,
		String patternCode,
		String badgeLabel
	) {
		this.user = user;
		this.patternCode = patternCode;
		this.badgeLabel = badgeLabel;
	}

	public void recordAttempt(
		int earnedPoints,
		int maxPoints,
		int pointsPercent,
		int correctAnswers,
		int questionCount,
		int correctPercent,
		boolean badgeUnlocked,
		int passingPercent,
		LocalDateTime attemptedAt
	) {
		this.attemptsCount += 1;
		this.cumulativePoints += earnedPoints;
		this.maxPoints = maxPoints;
		this.questionCount = questionCount;
		this.lastPoints = earnedPoints;
		this.lastPointsPercent = pointsPercent;
		this.lastCorrectAnswers = correctAnswers;
		this.lastCorrectPercent = correctPercent;
		this.lastAttemptAt = attemptedAt;

		if (earnedPoints > this.bestPoints
			|| (earnedPoints == this.bestPoints && correctPercent > this.bestCorrectPercent)) {
			this.bestPoints = earnedPoints;
			this.bestPointsPercent = pointsPercent;
			this.bestCorrectAnswers = correctAnswers;
			this.bestCorrectPercent = correctPercent;
		}

		if (!this.badgeUnlocked && badgeUnlocked && correctPercent >= passingPercent) {
			this.badgeUnlocked = true;
			this.badgeUnlockedAt = attemptedAt;
		}
	}

	public String getPatternCode() {
		return patternCode;
	}

	public int getAttemptsCount() {
		return attemptsCount;
	}

	public int getCumulativePoints() {
		return cumulativePoints;
	}

	public int getBestPoints() {
		return bestPoints;
	}

	public int getMaxPoints() {
		return maxPoints;
	}

	public int getBestPointsPercent() {
		return bestPointsPercent;
	}

	public int getBestCorrectAnswers() {
		return bestCorrectAnswers;
	}

	public int getQuestionCount() {
		return questionCount;
	}

	public int getBestCorrectPercent() {
		return bestCorrectPercent;
	}

	public int getLastPoints() {
		return lastPoints;
	}

	public int getLastPointsPercent() {
		return lastPointsPercent;
	}

	public int getLastCorrectAnswers() {
		return lastCorrectAnswers;
	}

	public int getLastCorrectPercent() {
		return lastCorrectPercent;
	}

	public boolean isBadgeUnlocked() {
		return badgeUnlocked;
	}

	public String getBadgeLabel() {
		return badgeLabel;
	}

	public LocalDateTime getBadgeUnlockedAt() {
		return badgeUnlockedAt;
	}

	public LocalDateTime getLastAttemptAt() {
		return lastAttemptAt;
	}
}
