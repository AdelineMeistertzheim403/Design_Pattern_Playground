package com.designpatternplayground.backend.pattern.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.designpatternplayground.backend.pattern.api.PatternDetailResponse;
import com.designpatternplayground.backend.pattern.api.PatternPreviewResponse;
import com.designpatternplayground.backend.pattern.api.PatternSummaryResponse;
import com.designpatternplayground.backend.pattern.domain.PatternExample;
import com.designpatternplayground.backend.pattern.domain.PatternExampleRepository;
import com.designpatternplayground.backend.pattern.preview.PatternPreviewFactory;
import com.designpatternplayground.backend.pattern.preview.PatternPreviewFormatter;
import com.designpatternplayground.backend.pattern.preview.PreviewFormat;

@Service
public class PatternCatalogService {

	private final PatternExampleRepository repository;
	private final PatternPreviewFactory previewFactory;

	public PatternCatalogService(
		PatternExampleRepository repository,
		PatternPreviewFactory previewFactory
	) {
		this.repository = repository;
		this.previewFactory = previewFactory;
	}

	public List<PatternSummaryResponse> findAll() {
		return repository.findAllByOrderByCategoryAscNameAsc()
			.stream()
			.map(PatternSummaryResponse::from)
			.toList();
	}

	public PatternDetailResponse findBySlug(String slug) {
		return PatternDetailResponse.from(findPattern(slug));
	}

	public PatternPreviewResponse preview(String slug, PreviewFormat format) {
		PatternExample pattern = findPattern(slug);
		PatternPreviewFormatter formatter = previewFactory.get(format);

		return PatternPreviewResponse.from(pattern, format, formatter.preview(pattern));
	}

	private PatternExample findPattern(String slug) {
		return repository.findBySlug(slug)
			.orElseThrow(() -> new PatternNotFoundException(slug));
	}
}
