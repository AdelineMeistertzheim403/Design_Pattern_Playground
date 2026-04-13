package com.designpatternplayground.backend.demo.visitor.domain;

public record VisitorTreeNode(
	String id,
	String parentId,
	String label,
	String kind,
	int depth,
	int sizeMb,
	boolean infected,
	boolean visited,
	boolean matched
) {
}
