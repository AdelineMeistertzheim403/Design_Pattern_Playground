package com.designpatternplayground.backend.demo.memento.domain;

public record MementoStep(
	int index,
	String actionCode,
	String actionLabel,
	String actorLabel,
	String detail,
	boolean snapshotCreated,
	String checkpointCode,
	MementoWorkspaceState state
) {
}
