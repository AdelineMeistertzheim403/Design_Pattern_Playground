package com.designpatternplayground.backend.quiz.domain;

import java.util.List;

public final class QuizQuestions {

	private QuizQuestions() {
	}

	public static QuizChoice choice(String id, String label) {
		return new QuizChoice(id, label);
	}

	public static QuizMatchingItem item(String id, String label) {
		return new QuizMatchingItem(id, label);
	}

	public static QuizMatchingPair pair(String leftId, String rightId) {
		return new QuizMatchingPair(leftId, rightId);
	}

	public static QuizOrderingItem orderingItem(String id, String label) {
		return new QuizOrderingItem(id, label);
	}

	public static QuizQuestion singleChoice(
		String id,
		String label,
		QuestionDifficulty difficulty,
		String explanation,
		List<QuizChoice> choices,
		String correctChoiceId
	) {
		return new QuizQuestion(
			id,
			label,
			QuestionType.QCM_SINGLE,
			difficulty,
			0,
			explanation,
			choices,
			List.of(correctChoiceId),
			List.of(),
			List.of(),
			List.of(),
			List.of(),
			List.of()
		);
	}

	public static QuizQuestion multipleChoice(
		String id,
		String label,
		QuestionDifficulty difficulty,
		String explanation,
		List<QuizChoice> choices,
		List<String> correctChoiceIds
	) {
		return new QuizQuestion(
			id,
			label,
			QuestionType.QCM_MULTIPLE,
			difficulty,
			0,
			explanation,
			choices,
			correctChoiceIds,
			List.of(),
			List.of(),
			List.of(),
			List.of(),
			List.of()
		);
	}

	public static QuizQuestion trueFalse(
		String id,
		String label,
		QuestionDifficulty difficulty,
		String explanation,
		boolean correct
	) {
		return new QuizQuestion(
			id,
			label,
			QuestionType.TRUE_FALSE,
			difficulty,
			0,
			explanation,
			List.of(
				choice("true", "Vrai"),
				choice("false", "Faux")
			),
			List.of(correct ? "true" : "false"),
			List.of(),
			List.of(),
			List.of(),
			List.of(),
			List.of()
		);
	}

	public static QuizQuestion matching(
		String id,
		String label,
		QuestionDifficulty difficulty,
		String explanation,
		List<QuizMatchingItem> leftItems,
		List<QuizMatchingItem> rightItems,
		List<QuizMatchingPair> correctPairs
	) {
		return new QuizQuestion(
			id,
			label,
			QuestionType.MATCHING,
			difficulty,
			0,
			explanation,
			List.of(),
			List.of(),
			leftItems,
			rightItems,
			correctPairs,
			List.of(),
			List.of()
		);
	}

	public static QuizQuestion ordering(
		String id,
		String label,
		QuestionDifficulty difficulty,
		String explanation,
		List<QuizOrderingItem> orderingItems,
		List<String> correctOrder
	) {
		return new QuizQuestion(
			id,
			label,
			QuestionType.ORDERING,
			difficulty,
			0,
			explanation,
			List.of(),
			List.of(),
			List.of(),
			List.of(),
			List.of(),
			orderingItems,
			correctOrder
		);
	}
}
