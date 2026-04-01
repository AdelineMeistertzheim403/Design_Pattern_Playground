package com.designpatternplayground.backend.demo.state.domain;

public record StateTransitionStep(
	int index,
	String actionCode,
	String actionLabel,
	String fromState,
	String toState,
	boolean accepted,
	String detail
) {
}
