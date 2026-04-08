package com.designpatternplayground.backend.demo.interpreter.domain;

public enum InterpreterFacing {

	NORTH(0, -1, "North"),
	EAST(1, 0, "East"),
	SOUTH(0, 1, "South"),
	WEST(-1, 0, "West");

	private final int deltaX;
	private final int deltaY;
	private final String label;

	InterpreterFacing(int deltaX, int deltaY, String label) {
		this.deltaX = deltaX;
		this.deltaY = deltaY;
		this.label = label;
	}

	public int deltaX() {
		return deltaX;
	}

	public int deltaY() {
		return deltaY;
	}

	public String label() {
		return label;
	}

	public InterpreterFacing turnLeft() {
		return switch (this) {
			case NORTH -> WEST;
			case WEST -> SOUTH;
			case SOUTH -> EAST;
			case EAST -> NORTH;
		};
	}

	public InterpreterFacing turnRight() {
		return switch (this) {
			case NORTH -> EAST;
			case EAST -> SOUTH;
			case SOUTH -> WEST;
			case WEST -> NORTH;
		};
	}
}
