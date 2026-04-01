package com.designpatternplayground.backend.quiz.domain;

public record QuizQuestionResult(
	String questionId,
	boolean correct,
	int earnedPoints,
	int availablePoints
) {
}
