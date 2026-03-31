package com.designpatternplayground.backend.pattern.api;

import com.designpatternplayground.backend.pattern.domain.PatternExample;

public record PatternSummaryResponse(
	String slug,
	String name,
	String category,
	String intent
) {

	public static PatternSummaryResponse from(PatternExample pattern) {
		return new PatternSummaryResponse(
			pattern.getSlug(),
			pattern.getName(),
			pattern.getCategory().label(),
			pattern.getIntent()
		);
	}
}
