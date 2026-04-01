package com.designpatternplayground.backend.quiz.domain;

import java.util.List;
import java.util.Map;

public record QuizAnswerSubmission(
	String questionId,
	List<String> selectedChoiceIds,
	Map<String, String> matchingAnswers,
	List<String> orderedItemIds
) {
}
