package com.designpatternplayground.backend.demo.memento.domain;

public record MementoCheckpoint(
	String code,
	String label,
	int stepIndex,
	String note,
	MementoWorkspaceState snapshotState
) {
}
