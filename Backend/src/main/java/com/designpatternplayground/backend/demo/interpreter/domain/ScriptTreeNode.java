package com.designpatternplayground.backend.demo.interpreter.domain;

public record ScriptTreeNode(
	String id,
	String parentId,
	String label,
	String kind,
	int depth,
	int lineNumber,
	boolean executable
) {
}
