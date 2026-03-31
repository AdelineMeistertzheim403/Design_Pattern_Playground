package com.designpatternplayground.backend.pattern.domain;

import java.util.Map;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record PatternExecutionRequest(
	@NotBlank(message = "patternCode is required")
	String patternCode,
	@NotNull(message = "parameters are required")
	Map<String, Object> parameters
) {
}
