package com.designpatternplayground.backend.pattern.domain;

import java.util.List;

public record VisualizationGraph(
	List<VisualizationNode> nodes,
	List<VisualizationEdge> edges
) {
}
