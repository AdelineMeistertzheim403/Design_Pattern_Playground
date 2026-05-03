package com.designpatternplayground.backend.quiz.domain;

import java.util.List;

import com.designpatternplayground.backend.progress.domain.MissionProgressSummaryResponse;
import com.designpatternplayground.backend.progress.domain.ProgressBadgeResponse;
import com.designpatternplayground.backend.progress.domain.ProgressProfileResponse;

public record QuizDashboardResponse(
	int totalPatterns,
	int startedPatterns,
	int validatedPatterns,
	int totalBestPoints,
	int totalMaxPoints,
	int totalAttempts,
	ProgressProfileResponse profile,
	MissionProgressSummaryResponse missions,
	List<ProgressBadgeResponse> badges,
	List<QuizDashboardPatternProgress> patterns
) {
}
