package com.designpatternplayground.backend.demo.command.domain;

public record CommandStackEntry(
	String actionCode,
	String actionLabel,
	String commandClass
) {
}
