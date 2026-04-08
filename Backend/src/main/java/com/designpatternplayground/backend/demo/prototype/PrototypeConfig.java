package com.designpatternplayground.backend.demo.prototype;

public record PrototypeConfig(
	String mode,
	String blueprintName,
	String archetype,
	int cloneCount,
	String mutationTarget,
	String mutationPreset
) {
}
