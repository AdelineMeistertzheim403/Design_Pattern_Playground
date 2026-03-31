package com.designpatternplayground.backend.pattern.domain;

import java.util.List;

public record PatternField(
	String name,
	String label,
	FieldType type,
	boolean required,
	List<String> allowedValues,
	String defaultValue
) {
}
