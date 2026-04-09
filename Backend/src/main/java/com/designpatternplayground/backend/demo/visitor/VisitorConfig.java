package com.designpatternplayground.backend.demo.visitor;

public record VisitorConfig(
	String mode,
	String treePreset,
	String visitorType,
	String searchTerm
) {
}
