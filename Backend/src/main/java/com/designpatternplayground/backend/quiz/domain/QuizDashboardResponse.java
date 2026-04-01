package com.designpatternplayground.backend.quiz.domain;

import java.util.List;

public record QuizDashboardResponse(
	int totalPatterns,
	int startedPatterns,
	int validatedPatterns,
	int totalBestPoints,
	int totalMaxPoints,
	int totalAttempts,
	List<QuizDashboardPatternProgress> patterns
) {
}
