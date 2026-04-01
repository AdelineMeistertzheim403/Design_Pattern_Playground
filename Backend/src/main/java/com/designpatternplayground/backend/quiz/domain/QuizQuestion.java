package com.designpatternplayground.backend.quiz.domain;

import java.util.List;

public record QuizQuestion(
	String id,
	String label,
	QuestionType type,
	QuestionDifficulty difficulty,
	int points,
	String explanation,
	List<QuizChoice> choices,
	List<String> correctChoiceIds,
	List<QuizMatchingItem> leftItems,
	List<QuizMatchingItem> rightItems,
	List<QuizMatchingPair> correctPairs,
	List<QuizOrderingItem> orderingItems,
	List<String> correctOrder
) {

	public QuizQuestion withPoints(int nextPoints) {
		return new QuizQuestion(
			id,
			label,
			type,
			difficulty,
			nextPoints,
			explanation,
			choices,
			correctChoiceIds,
			leftItems,
			rightItems,
			correctPairs,
			orderingItems,
			correctOrder
		);
	}
}
