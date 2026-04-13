package com.designpatternplayground.backend.demo.composite.domain;

public record CompositeNodeSnapshot(
	String id,
	String parentId,
	String label,
	String kind,
	int depth,
	int sizeMb,
	boolean processed
) {
}
