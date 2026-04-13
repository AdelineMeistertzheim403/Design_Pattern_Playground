package com.designpatternplayground.backend.demo.memento;

public record MementoConfig(
	String mode,
	String presetCode,
	String workspaceName,
	String restoreTarget
) {
}
