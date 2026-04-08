package com.designpatternplayground.backend.demo.proxy.domain;

public record ProxyStep(
	int index,
	String stageCode,
	String title,
	String actorLabel,
	String status,
	String detail,
	int latencyMs
) {
}
