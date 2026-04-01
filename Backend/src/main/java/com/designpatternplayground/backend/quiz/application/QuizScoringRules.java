package com.designpatternplayground.backend.quiz.application;

import java.util.Locale;

import com.designpatternplayground.backend.quiz.domain.QuestionDifficulty;

public final class QuizScoringRules {

	private QuizScoringRules() {
	}

	public static int pointsFor(String patternComplexityLevel, QuestionDifficulty difficulty) {
		return switch (normalize(patternComplexityLevel)) {
			case "ADVANCED" -> switch (difficulty) {
				case EASY -> 15;
				case MEDIUM -> 22;
				case HARD -> 30;
			};
			case "INTERMEDIATE" -> switch (difficulty) {
				case EASY -> 12;
				case MEDIUM -> 18;
				case HARD -> 24;
			};
			default -> switch (difficulty) {
				case EASY -> 10;
				case MEDIUM -> 15;
				case HARD -> 20;
			};
		};
	}

	private static String normalize(String complexityLevel) {
		return complexityLevel == null
			? ""
			: complexityLevel.trim().toUpperCase(Locale.ROOT);
	}
}
