package com.designpatternplayground.backend.demo.iterator.domain;

public record IteratorTraversalStep(
	int index,
	String action,
	String actorLabel,
	String targetId,
	String targetLabel,
	int pointerIndex,
	boolean previousStable,
	String detail
) {
}
