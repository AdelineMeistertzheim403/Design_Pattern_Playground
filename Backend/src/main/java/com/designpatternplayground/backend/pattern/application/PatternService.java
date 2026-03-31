package com.designpatternplayground.backend.pattern.application;

import java.util.List;

import org.springframework.stereotype.Service;

import com.designpatternplayground.backend.pattern.domain.PatternExecutionRequest;
import com.designpatternplayground.backend.pattern.domain.PatternExecutionResult;
import com.designpatternplayground.backend.pattern.domain.PatternMetadata;
import com.designpatternplayground.backend.pattern.domain.PatternSchema;
import com.designpatternplayground.backend.pattern.registry.PatternRegistry;

@Service
public class PatternService {

	private final PatternRegistry registry;

	public PatternService(PatternRegistry registry) {
		this.registry = registry;
	}

	public List<PatternMetadata> getAllPatterns() {
		return registry.getAllMetadata();
	}

	public PatternMetadata getPattern(String code) {
		return registry.getByCode(code).getMetadata();
	}

	public PatternSchema getSchema(String code) {
		return registry.getByCode(code).getSchema();
	}

	public PatternExecutionResult execute(PatternExecutionRequest request) {
		return registry.getByCode(request.patternCode()).execute(request);
	}
}
