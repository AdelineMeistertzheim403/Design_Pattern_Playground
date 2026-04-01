package com.designpatternplayground.backend.quiz.api;

import com.designpatternplayground.backend.quiz.domain.PatternQuiz;

public interface PatternQuizProvider {

	String getPatternCode();

	PatternQuiz getQuiz();
}
