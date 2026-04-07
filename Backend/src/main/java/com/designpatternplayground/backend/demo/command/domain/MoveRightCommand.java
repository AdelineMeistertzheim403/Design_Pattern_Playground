package com.designpatternplayground.backend.demo.command.domain;

public class MoveRightCommand extends AbstractBoardCommand {

	@Override
	public CommandAction action() {
		return CommandAction.MOVE_RIGHT;
	}

	@Override
	public String label() {
		return "MoveRightCommand";
	}

	@Override
	protected void apply(CommandBoard board) {
		board.moveRight();
	}
}
