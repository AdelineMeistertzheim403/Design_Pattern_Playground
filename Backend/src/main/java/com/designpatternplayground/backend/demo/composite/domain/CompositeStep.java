package com.designpatternplayground.backend.demo.composite.domain;

public record CompositeStep(
	int index,
	String stageCode,
	String title,
	String actorLabel,
	String status,
	String detail
) {
}
