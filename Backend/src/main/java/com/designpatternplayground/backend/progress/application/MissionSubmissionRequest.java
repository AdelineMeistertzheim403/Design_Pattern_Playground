package com.designpatternplayground.backend.progress.application;

import java.util.List;

public record MissionSubmissionRequest(
	String missionId,
	boolean success,
	int score,
	int durationSeconds,
	List<String> selectedPatterns
) {
}
