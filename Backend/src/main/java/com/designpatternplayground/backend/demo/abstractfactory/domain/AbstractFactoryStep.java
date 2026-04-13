package com.designpatternplayground.backend.demo.abstractfactory.domain;

public record AbstractFactoryStep(
	int index,
	String stageCode,
	String title,
	String actorLabel,
	String detail,
	boolean coherentFamily,
	boolean usesFactory
) {
}
