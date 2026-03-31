package com.designpatternplayground.backend.pattern.api;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.designpatternplayground.backend.pattern.preview.PreviewFormat;
import com.designpatternplayground.backend.pattern.service.PatternCatalogService;

@RestController
@RequestMapping("/api/patterns")
public class PatternCatalogController {

	private final PatternCatalogService service;

	public PatternCatalogController(PatternCatalogService service) {
		this.service = service;
	}

	@GetMapping
	public List<PatternSummaryResponse> listPatterns() {
		return service.findAll();
	}

	@GetMapping("/{slug}")
	public PatternDetailResponse getPattern(@PathVariable String slug) {
		return service.findBySlug(slug);
	}

	@GetMapping("/{slug}/preview")
	public PatternPreviewResponse previewPattern(
		@PathVariable String slug,
		@RequestParam(defaultValue = "text") String format
	) {
		return service.preview(slug, PreviewFormat.from(format));
	}
}
