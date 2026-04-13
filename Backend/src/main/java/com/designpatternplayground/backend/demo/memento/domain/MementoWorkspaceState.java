package com.designpatternplayground.backend.demo.memento.domain;

public record MementoWorkspaceState(
	String sceneLabel,
	String theme,
	int energy,
	int layerCount,
	int annotationCount,
	String alertLevel
) {
}
