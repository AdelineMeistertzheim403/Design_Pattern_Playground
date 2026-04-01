package com.designpatternplayground.backend.demo.flyweight;

public record FlyweightConfig(
	String assetType,
	int objectCount,
	int sharedVariantCount,
	boolean useFlyweight
) {
}
