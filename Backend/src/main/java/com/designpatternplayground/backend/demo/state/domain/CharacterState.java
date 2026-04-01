package com.designpatternplayground.backend.demo.state.domain;

import java.util.List;

public interface CharacterState {

	String code();

	String label();

	List<CharacterAction> availableActions();

	TransitionResult onAction(CharacterAction action, String characterName);
}
