package com.designpatternplayground.backend.demo.command.domain;

public abstract class AbstractBoardCommand implements BoardCommand {

	private CommandBoardSnapshot beforeState;

	@Override
	public final void execute(CommandBoard board) {
		beforeState = board.snapshot();
		apply(board);
	}

	@Override
	public final void undo(CommandBoard board) {
		if (beforeState != null) {
			board.restore(beforeState);
		}
	}

	protected abstract void apply(CommandBoard board);
}
