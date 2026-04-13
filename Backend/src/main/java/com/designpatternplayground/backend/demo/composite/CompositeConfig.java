package com.designpatternplayground.backend.demo.composite;

public record CompositeConfig(
	String mode,
	String rootName,
	String blueprintCode,
	int extraLeafCount,
	String operationLabel
) {
}
