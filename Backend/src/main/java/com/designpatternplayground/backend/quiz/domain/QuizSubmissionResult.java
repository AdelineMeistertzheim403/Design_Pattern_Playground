package com.designpatternplayground.backend.quiz.domain;

import java.util.List;

public record QuizSubmissionResult(
	String patternCode,
	int correctAnswers,
	int questionCount,
	int correctPercent,
	int earnedPoints,
	int maxPoints,
	int pointsPercent,
	boolean badgeUnlocked,
	String badgeLabel,
	List<QuizQuestionResult> questionResults,
	QuizProgressResponse progress
) {
}
