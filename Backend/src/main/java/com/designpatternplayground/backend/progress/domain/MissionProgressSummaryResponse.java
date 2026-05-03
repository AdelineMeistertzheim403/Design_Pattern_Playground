package com.designpatternplayground.backend.progress.domain;

public record MissionProgressSummaryResponse(
	int attemptedMissions,
	int successfulMissions,
	int successfulAdvancedMissions,
	int multiPatternMissionSuccesses,
	int bestSuccessStreak,
	int bestHardMissionSuccessStreak
) {
}
