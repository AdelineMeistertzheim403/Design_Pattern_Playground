package com.designpatternplayground.backend.quiz.domain;

import java.time.LocalDateTime;

public record QuizProgressResponse(
	String patternCode,
	int attemptsCount,
	int cumulativePoints,
	int bestPoints,
	int maxPoints,
	int bestPointsPercent,
	int bestCorrectAnswers,
	int questionCount,
	int bestCorrectPercent,
	int lastPoints,
	int lastPointsPercent,
	int lastCorrectAnswers,
	int lastCorrectPercent,
	boolean badgeUnlocked,
	String badgeLabel,
	int passingPercent,
	LocalDateTime badgeUnlockedAt,
	LocalDateTime lastAttemptAt
) {
}
