package com.designpatternplayground.backend.demo.command;

import java.util.List;

public record CommandConfig(
	String mode,
	String boardName,
	String actorName,
	List<String> actions
) {
}
