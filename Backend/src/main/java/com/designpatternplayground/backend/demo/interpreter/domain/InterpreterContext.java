package com.designpatternplayground.backend.demo.interpreter.domain;

public final class InterpreterContext {

	private final int boardWidth;
	private final int boardHeight;
	private final InterpreterObjective objective;
	private int x;
	private int y;
	private InterpreterFacing facing;
	private boolean targetHit;

	public InterpreterContext(
		int boardWidth,
		int boardHeight,
		int startX,
		int startY,
		InterpreterFacing facing,
		InterpreterObjective objective
	) {
		this.boardWidth = boardWidth;
		this.boardHeight = boardHeight;
		this.x = startX;
		this.y = startY;
		this.facing = facing;
		this.objective = objective;
		this.targetHit = false;
	}

	public boolean moveOne() {
		int nextX = Math.max(1, Math.min(boardWidth, x + facing.deltaX()));
		int nextY = Math.max(1, Math.min(boardHeight, y + facing.deltaY()));
		boolean moved = nextX != x || nextY != y;
		this.x = nextX;
		this.y = nextY;
		return moved;
	}

	public void turnLeft() {
		this.facing = facing.turnLeft();
	}

	public void turnRight() {
		this.facing = facing.turnRight();
	}

	public void attack() {
		if (targetReached()) {
			this.targetHit = true;
		}
	}

	public boolean targetReached() {
		return x == objective.targetX() && y == objective.targetY();
	}

	public boolean targetHit() {
		return targetHit;
	}

	public boolean objectiveCompleted() {
		return targetReached() && (!objective.requiresAttack() || targetHit);
	}

	public int x() {
		return x;
	}

	public int y() {
		return y;
	}

	public InterpreterFacing facing() {
		return facing;
	}
}
