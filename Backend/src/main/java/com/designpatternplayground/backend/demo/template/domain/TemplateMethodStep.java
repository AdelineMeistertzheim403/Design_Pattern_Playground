package com.designpatternplayground.backend.demo.template.domain;

public record TemplateMethodStep(
	int index,
	String stageCode,
	String stageLabel,
	String actorLabel,
	String status,
	String detail,
	boolean variableStage
) {
}
