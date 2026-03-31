package com.designpatternplayground.backend.pattern.preview;

import java.util.List;

import org.springframework.stereotype.Component;

import com.designpatternplayground.backend.pattern.domain.PatternExample;

@Component
public class ChecklistPatternPreviewFormatter implements PatternPreviewFormatter {

	@Override
	public PreviewFormat format() {
		return PreviewFormat.CHECKLIST;
	}

	@Override
	public List<String> preview(PatternExample pattern) {
		return List.of(
			"Isoler les roles et les responsabilites pour " + pattern.getName(),
			"Montrer un exemple concret en Java Spring Boot autour de " + pattern.getBackendFocus(),
			"Refleter la meme intention dans le front React via " + pattern.getFrontendFocus(),
			"Conclure avec les compromis et les cas ou le pattern devient excessif"
		);
	}
}
