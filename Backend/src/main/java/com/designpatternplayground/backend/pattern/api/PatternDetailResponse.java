package com.designpatternplayground.backend.pattern.api;

import com.designpatternplayground.backend.pattern.domain.PatternExample;

public record PatternDetailResponse(
	String slug,
	String name,
	String category,
	String intent,
	String backendFocus,
	String frontendFocus,
	String notes
) {

	public static PatternDetailResponse from(PatternExample pattern) {
		return new PatternDetailResponse(
			pattern.getSlug(),
			pattern.getName(),
			pattern.getCategory().label(),
			pattern.getIntent(),
			pattern.getBackendFocus(),
			pattern.getFrontendFocus(),
			pattern.getNotes()
		);
	}
}
