package com.designpatternplayground.backend.web;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.Authentication;

import com.designpatternplayground.backend.auth.security.AuthenticatedUser;
import com.designpatternplayground.backend.pattern.application.PatternService;
import com.designpatternplayground.backend.pattern.domain.PatternExecutionRequest;
import com.designpatternplayground.backend.pattern.domain.PatternExecutionResult;
import com.designpatternplayground.backend.pattern.domain.PatternMetadata;
import com.designpatternplayground.backend.pattern.domain.PatternSchema;
import com.designpatternplayground.backend.quiz.application.PatternQuizProgressService;
import com.designpatternplayground.backend.quiz.application.PatternQuizService;
import com.designpatternplayground.backend.quiz.domain.PatternQuiz;
import com.designpatternplayground.backend.quiz.domain.QuizProgressResponse;
import com.designpatternplayground.backend.quiz.domain.QuizSubmissionRequest;
import com.designpatternplayground.backend.quiz.domain.QuizSubmissionResult;

@RestController
@RequestMapping("/api/patterns")
public class PatternController {

	private final PatternService patternService;
	private final PatternQuizService patternQuizService;
	private final PatternQuizProgressService patternQuizProgressService;

	public PatternController(
		PatternService patternService,
		PatternQuizService patternQuizService,
		PatternQuizProgressService patternQuizProgressService
	) {
		this.patternService = patternService;
		this.patternQuizService = patternQuizService;
		this.patternQuizProgressService = patternQuizProgressService;
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

	@GetMapping("/{code}/quiz")
	public PatternQuiz getQuiz(@PathVariable String code) {
		return patternQuizService.getQuiz(code);
	}

	@GetMapping("/{code}/quiz/progress")
	public QuizProgressResponse getQuizProgress(@PathVariable String code, Authentication authentication) {
		return patternQuizProgressService.getProgress(code, (AuthenticatedUser) authentication.getPrincipal());
	}

	@PostMapping("/{code}/quiz/submissions")
	public QuizSubmissionResult submitQuiz(
		@PathVariable String code,
		@RequestBody QuizSubmissionRequest request,
		Authentication authentication
	) {
		return patternQuizProgressService.submit(code, (AuthenticatedUser) authentication.getPrincipal(), request);
	}

	@PostMapping("/execute")
	public PatternExecutionResult execute(@Valid @RequestBody PatternExecutionRequest request) {
		return patternService.execute(request);
	}
}
