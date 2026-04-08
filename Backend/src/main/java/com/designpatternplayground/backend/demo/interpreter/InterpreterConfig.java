package com.designpatternplayground.backend.demo.interpreter;

import java.util.List;

public record InterpreterConfig(
	String mode,
	String missionName,
	String objective,
	List<String> scriptLines
) {
}
