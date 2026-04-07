package com.designpatternplayground.backend.demo.command.domain;

public interface BoardCommand {

	CommandAction action();

	String label();

	void execute(CommandBoard board);

	void undo(CommandBoard board);
}
