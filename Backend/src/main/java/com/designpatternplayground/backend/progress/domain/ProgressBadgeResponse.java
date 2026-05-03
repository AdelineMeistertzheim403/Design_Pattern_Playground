package com.designpatternplayground.backend.progress.domain;

import java.time.LocalDateTime;

public record ProgressBadgeResponse(
	String code,
	String name,
	String description,
	String category,
	boolean secret,
	boolean unlocked,
	LocalDateTime unlockedAt
) {
}
