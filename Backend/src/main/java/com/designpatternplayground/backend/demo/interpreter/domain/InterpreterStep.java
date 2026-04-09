package com.designpatternplayground.backend.demo.interpreter.domain;

public record InterpreterStep(
	int lineNumber,
	String sourceLine,
	String actionCode,
	String detail,
	int x,
	int y,
	String facing,
	boolean targetReached,
	boolean targetHit,
	boolean objectiveCompleted
) {
}
