package com.designpatternplayground.backend.demo.command.domain;

public class DeleteBeaconCommand extends AbstractBoardCommand {

	@Override
	public CommandAction action() {
		return CommandAction.DELETE_BEACON;
	}

	@Override
	public String label() {
		return "DeleteBeaconCommand";
	}

	@Override
	protected void apply(CommandBoard board) {
		board.deleteBeacon();
	}
}
