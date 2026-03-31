package com.designpatternplayground.backend.web;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.designpatternplayground.backend.pattern.application.PatternService;
import com.designpatternplayground.backend.pattern.domain.PatternExecutionRequest;
import com.designpatternplayground.backend.pattern.domain.PatternExecutionResult;
import com.designpatternplayground.backend.pattern.domain.PatternMetadata;
import com.designpatternplayground.backend.pattern.domain.PatternSchema;

@RestController
@RequestMapping("/api/patterns")
public class PatternController {

	private final PatternService patternService;

	public PatternController(PatternService patternService) {
		this.patternService = patternService;
	}

	@GetMapping
	public List<PatternMetadata> getPatterns() {
		return patternService.getAllPatterns();
	}

	@GetMapping("/{code}")
	public PatternMetadata getPattern(@PathVariable String code) {
		return patternService.getPattern(code);
	}

	@GetMapping("/{code}/schema")
	public PatternSchema getSchema(@PathVariable String code) {
		return patternService.getSchema(code);
	}

	@PostMapping("/execute")
	public PatternExecutionResult execute(@Valid @RequestBody PatternExecutionRequest request) {
		return patternService.execute(request);
	}
}
