package com.designpatternplayground.backend.demo.abstractfactory.domain;

public record ThemeArtifact(
	String slotCode,
	String slotLabel,
	String className,
	String label,
	String detail
) {
}
