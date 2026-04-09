package com.designpatternplayground.backend.demo.visitor.domain;

public record VisitorTraversalStep(
	String nodeId,
	String nodeLabel,
	String nodeKind,
	int depth,
	String detail,
	boolean matched
) {
}
