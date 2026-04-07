package com.designpatternplayground.backend.demo.command.domain;

public class AddBeaconCommand extends AbstractBoardCommand {

	@Override
	public CommandAction action() {
		return CommandAction.ADD_BEACON;
	}

	@Override
	public String label() {
		return "AddBeaconCommand";
	}

	@Override
	protected void apply(CommandBoard board) {
		board.addBeacon();
	}
}
