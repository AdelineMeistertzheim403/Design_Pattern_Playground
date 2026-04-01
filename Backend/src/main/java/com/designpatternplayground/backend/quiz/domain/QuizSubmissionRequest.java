package com.designpatternplayground.backend.quiz.domain;

import java.util.List;

public record QuizSubmissionRequest(
	List<QuizAnswerSubmission> answers
) {
}
