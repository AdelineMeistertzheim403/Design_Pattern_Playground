package com.designpatternplayground.backend.demo.command.domain;

import java.util.List;

public record CommandStep(
	int index,
	String actionCode,
	String actionLabel,
	String operationType,
	boolean accepted,
	String detail,
	int positionX,
	int positionY,
	int beaconCount,
	int undoDepth,
	int redoDepth,
	List<CommandStackEntry> undoStack,
	List<CommandStackEntry> redoStack
) {
}
