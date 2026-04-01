package com.designpatternplayground.backend.demo.state.domain;

public record TransitionResult(
	CharacterState nextState,
	boolean accepted,
	String detail
) {
}
