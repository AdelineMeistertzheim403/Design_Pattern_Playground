package com.designpatternplayground.backend.demo.iterator.domain;

public record IteratorItemSnapshot(
	String id,
	String label,
	String kind,
	int depth,
	int linearIndex
) {
}
