package com.designpatternplayground.backend.progress.domain;

public record BadgeDefinition(
	String code,
	String name,
	String description,
	ProgressBadgeCategory category,
	boolean secret
) {
}
