package com.designpatternplayground.backend.quiz.application;

import java.util.List;

import org.springframework.stereotype.Service;

import com.designpatternplayground.backend.pattern.application.PatternService;
import com.designpatternplayground.backend.pattern.domain.PatternMetadata;
import com.designpatternplayground.backend.quiz.domain.PatternQuiz;
import com.designpatternplayground.backend.quiz.domain.QuizQuestion;
import com.designpatternplayground.backend.quiz.registry.PatternQuizRegistry;

@Service
public class PatternQuizService {

	private final PatternQuizRegistry registry;
	private final PatternService patternService;

	public PatternQuizService(PatternQuizRegistry registry, PatternService patternService) {
		this.registry = registry;
		this.patternService = patternService;
	}

	public PatternQuiz getQuiz(String code) {
		PatternQuiz quiz = registry.getByPatternCode(code);
		PatternMetadata pattern = patternService.getPattern(code);
		List<QuizQuestion> enrichedQuestions = quiz.questions().stream()
			.map(question -> question.withPoints(
				QuizScoringRules.pointsFor(pattern.complexityLevel(), question.difficulty())
			))
			.toList();
		int maxPoints = enrichedQuestions.stream()
			.mapToInt(QuizQuestion::points)
			.sum();

		return new PatternQuiz(
			quiz.patternCode(),
			quiz.title(),
			quiz.description(),
			quiz.passingPercent(),
			quiz.badgeLabel(),
			maxPoints,
			enrichedQuestions
		);
	}
}
