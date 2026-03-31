package com.designpatternplayground.backend.pattern.preview;

import java.util.List;

import org.springframework.stereotype.Component;

import com.designpatternplayground.backend.pattern.domain.PatternExample;

@Component
public class TextPatternPreviewFormatter implements PatternPreviewFormatter {

	@Override
	public PreviewFormat format() {
		return PreviewFormat.TEXT;
	}

	@Override
	public List<String> preview(PatternExample pattern) {
		return List.of(
			"Intent: " + pattern.getIntent(),
			"Backend: " + pattern.getBackendFocus(),
			"Frontend: " + pattern.getFrontendFocus()
		);
	}
}
