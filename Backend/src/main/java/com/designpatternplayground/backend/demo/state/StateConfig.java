package com.designpatternplayground.backend.demo.state;

import java.util.List;

public record StateConfig(
	String characterName,
	String initialState,
	List<String> actions
) {
}
