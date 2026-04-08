package com.designpatternplayground.backend.demo.adapter.domain;

public record AdaptationStep(
	int index,
	String stageCode,
	String title,
	String systemLabel,
	String protocolLabel,
	String signalLabel,
	String detail,
	boolean success
) {
}
