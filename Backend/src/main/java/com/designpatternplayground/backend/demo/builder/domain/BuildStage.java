package com.designpatternplayground.backend.demo.builder.domain;

public record BuildStage(
	int index,
	String stageCode,
	String stageLabel,
	String optionCode,
	String optionLabel,
	String detail,
	BuildStats deltaStats,
	BuildStats cumulativeStats
) {
}
