package com.designpatternplayground.backend.common.exception;

public class PatternNotFoundException extends RuntimeException {

	public PatternNotFoundException(String code) {
		super("Pattern not found for code: " + code);
	}
}
