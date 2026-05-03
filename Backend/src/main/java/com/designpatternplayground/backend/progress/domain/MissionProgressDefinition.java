package com.designpatternplayground.backend.progress.domain;

import java.util.List;

public record MissionProgressDefinition(
	String id,
	String title,
	MissionDifficulty difficulty,
	List<String> relatedPatterns
) {

	public boolean isAdvanced() {
		return difficulty == MissionDifficulty.ADVANCED;
	}

	public boolean isMultiPattern() {
		return relatedPatterns.size() > 1;
	}

	public int xpReward() {
		return switch (difficulty) {
			case BEGINNER -> 40;
			case INTERMEDIATE -> 70;
			case ADVANCED -> 120;
		};
	}
}
