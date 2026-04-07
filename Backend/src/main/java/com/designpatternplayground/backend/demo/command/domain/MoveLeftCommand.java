package com.designpatternplayground.backend.demo.command.domain;

public class MoveLeftCommand extends AbstractBoardCommand {

	@Override
	public CommandAction action() {
		return CommandAction.MOVE_LEFT;
	}

	@Override
	public String label() {
		return "MoveLeftCommand";
	}

	@Override
	protected void apply(CommandBoard board) {
		board.moveLeft();
	}
}
