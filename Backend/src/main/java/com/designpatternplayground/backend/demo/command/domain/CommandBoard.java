package com.designpatternplayground.backend.demo.command.domain;

public class CommandBoard {

	private final String boardName;
	private final String actorName;
	private final int gridSize;

	private int x;
	private int y;
	private int beaconCount;

	public CommandBoard(String boardName, String actorName) {
		this(boardName, actorName, 5);
	}

	public CommandBoard(String boardName, String actorName, int gridSize) {
		this.boardName = boardName;
		this.actorName = actorName;
		this.gridSize = gridSize;
		this.x = 0;
		this.y = 0;
		this.beaconCount = 0;
	}

	public String boardName() {
		return boardName;
	}

	public String actorName() {
		return actorName;
	}

	public int gridSize() {
		return gridSize;
	}

	public int x() {
		return x;
	}

	public int y() {
		return y;
	}

	public int beaconCount() {
		return beaconCount;
	}

	public void moveRight() {
		x = Math.min(gridSize - 1, x + 1);
	}

	public void moveUp() {
		y = Math.min(gridSize - 1, y + 1);
	}

	public void moveLeft() {
		x = Math.max(0, x - 1);
	}

	public void addBeacon() {
		beaconCount += 1;
	}

	public void deleteBeacon() {
		beaconCount = Math.max(0, beaconCount - 1);
	}

	public CommandBoardSnapshot snapshot() {
		return new CommandBoardSnapshot(x, y, beaconCount);
	}

	public void restore(CommandBoardSnapshot snapshot) {
		this.x = snapshot.x();
		this.y = snapshot.y();
		this.beaconCount = snapshot.beaconCount();
	}
}
