package com.designpatternplayground.backend.demo.builder;

public record BuilderConfig(
	String mode,
	String buildName,
	String productType,
	String silhouette,
	String coreModule,
	String addonModule,
	String finishStyle
) {
}
