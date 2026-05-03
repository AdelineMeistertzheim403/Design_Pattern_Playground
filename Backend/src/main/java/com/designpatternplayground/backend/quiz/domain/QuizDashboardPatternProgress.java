package com.designpatternplayground.backend.quiz.domain;

import java.time.LocalDateTime;

public record QuizDashboardPatternProgress(
	String patternCode,
	String patternName,
	String patternType,
	String complexityLevel,
	String description,
	String useCase,
	String badgeLabel,
	int passingPercent,
	int questionCount,
	int maxPoints,
	int attemptsCount,
	int bestPoints,
	int bestPointsPercent,
	int bestCorrectPercent,
	int lastPoints,
	int lastPointsPercent,
	int lastCorrectPercent,
	int cumulativePoints,
	boolean badgeUnlocked,
	LocalDateTime badgeUnlockedAt,
	LocalDateTime lastAttemptAt,
	int masteryPercent,
	String masteryLabel,
	boolean demoCompleted,
	boolean quizPassed,
	boolean missionCompleted,
	boolean advancedMissionCompleted,
	boolean mastered,
	LocalDateTime masteredAt
) {
}
