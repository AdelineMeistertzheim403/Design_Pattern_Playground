package com.designpatternplayground.backend.common.exception;

public class QuizNotFoundException extends RuntimeException {

	public QuizNotFoundException(String code) {
		super("Aucun quiz trouve pour le pattern : " + code);
	}
}
