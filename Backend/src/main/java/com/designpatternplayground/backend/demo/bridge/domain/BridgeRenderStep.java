package com.designpatternplayground.backend.demo.bridge.domain;

public record BridgeRenderStep(
	int index,
	String stageCode,
	String title,
	String actorLabel,
	String detail,
	boolean abstractionStable,
	boolean implementationReusable
) {
}
