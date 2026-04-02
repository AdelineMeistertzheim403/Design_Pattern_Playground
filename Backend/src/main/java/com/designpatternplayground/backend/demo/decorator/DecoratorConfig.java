package com.designpatternplayground.backend.demo.decorator;

import java.util.List;

public record DecoratorConfig(
	String characterName,
	String baseType,
	List<String> decorators
) {
}
