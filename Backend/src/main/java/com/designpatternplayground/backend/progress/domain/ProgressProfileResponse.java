package com.designpatternplayground.backend.progress.domain;

public record ProgressProfileResponse(
	int totalXp,
	int level,
	int currentLevelXp,
	Integer nextLevelXp,
	String rank,
	int unlockedBadgeCount,
	int totalBadgeCount
) {
}
