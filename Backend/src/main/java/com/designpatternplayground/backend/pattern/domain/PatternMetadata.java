package com.designpatternplayground.backend.pattern.domain;

public record PatternMetadata(
	String code,
	String name,
	PatternType type,
	String description,
	String useCase,
	String complexityLevel
) {
}
