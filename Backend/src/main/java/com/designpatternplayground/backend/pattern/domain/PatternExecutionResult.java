package com.designpatternplayground.backend.pattern.domain;

import java.util.List;

public record PatternExecutionResult(
	String patternCode,
	String summary,
	List<String> logs,
	Object output,
	VisualizationGraph visualization
) {
}
