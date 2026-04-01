package com.designpatternplayground.backend.quiz.domain;

import java.util.List;

public record PatternQuiz(
	String patternCode,
	String title,
	String description,
	int passingPercent,
	String badgeLabel,
	int maxPoints,
	List<QuizQuestion> questions
) {
}
