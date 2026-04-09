package com.designpatternplayground.backend.demo.facade.domain;

public record FacadeStep(
	int index,
	String stageCode,
	String systemCode,
	String title,
	String actorLabel,
	String status,
	String detail
) {
}
