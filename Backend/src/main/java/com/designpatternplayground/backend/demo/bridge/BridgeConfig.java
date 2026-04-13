package com.designpatternplayground.backend.demo.bridge;

public record BridgeConfig(
	String mode,
	String shapeCode,
	String renderCode,
	String objectName
) {
}
