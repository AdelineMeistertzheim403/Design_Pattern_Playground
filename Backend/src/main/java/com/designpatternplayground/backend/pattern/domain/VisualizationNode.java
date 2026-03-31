package com.designpatternplayground.backend.pattern.domain;

import java.util.Map;

public record VisualizationNode(
	String id,
	String label,
	String type,
	Map<String, Object> data
) {
}
