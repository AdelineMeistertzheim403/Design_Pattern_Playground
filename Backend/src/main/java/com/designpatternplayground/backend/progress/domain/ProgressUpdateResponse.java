package com.designpatternplayground.backend.progress.domain;

import java.util.List;

public record ProgressUpdateResponse(
	int xpGained,
	int totalXp,
	int level,
	String rank,
	List<ProgressBadgeResponse> newlyUnlockedBadges
) {
}
