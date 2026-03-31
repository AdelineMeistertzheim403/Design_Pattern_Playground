package com.designpatternplayground.backend.pattern.service;

public class PatternNotFoundException extends RuntimeException {

	public PatternNotFoundException(String slug) {
		super("Pattern not found: " + slug);
	}
}
