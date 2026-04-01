package com.designpatternplayground.backend.demo.flyweight.domain;

public record SharedSceneAsset(
	String variantCode,
	String label,
	int intrinsicStateKb,
	String description
) {
}
