package com.designpatternplayground.backend.pattern.api;

import java.util.List;

import com.designpatternplayground.backend.pattern.domain.PatternExample;
import com.designpatternplayground.backend.pattern.preview.PreviewFormat;

public record PatternPreviewResponse(
	String slug,
	String name,
	String format,
	List<String> lines
) {

	public static PatternPreviewResponse from(
		PatternExample pattern,
		PreviewFormat format,
		List<String> lines
	) {
		return new PatternPreviewResponse(
			pattern.getSlug(),
			pattern.getName(),
			format.apiValue(),
			lines
		);
	}
}
