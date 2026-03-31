package com.designpatternplayground.backend.pattern.domain;

public enum PatternCategory {
	CREATION("Creation"),
	STRUCTURE("Structure"),
	COMPORTEMENT("Comportement");

	private final String label;

	PatternCategory(String label) {
		this.label = label;
	}

	public String label() {
		return label;
	}
}
