package com.designpatternplayground.backend.demo.command.domain;

public class MoveUpCommand extends AbstractBoardCommand {

	@Override
	public CommandAction action() {
		return CommandAction.MOVE_UP;
	}

	@Override
	public String label() {
		return "MoveUpCommand";
	}

	@Override
	protected void apply(CommandBoard board) {
		board.moveUp();
	}
}
