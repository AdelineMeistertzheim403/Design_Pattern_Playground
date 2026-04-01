package com.designpatternplayground.backend.demo.singleton.domain;

public record ClientPerspective(
	String clientName,
	String instanceId,
	String visibleValue,
	boolean shared
) {
}
