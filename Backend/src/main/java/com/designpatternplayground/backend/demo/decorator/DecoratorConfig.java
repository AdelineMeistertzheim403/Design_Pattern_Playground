package com.designpatternplayground.backend.demo.decorator;

import java.util.List;

public record DecoratorConfig(
	String mode,
	String characterName,
	String baseType,
	List<String> decorators
) {
}
