package com.designpatternplayground.backend.demo.state.domain;

import java.util.List;

public class JumpingState implements CharacterState {

	@Override
	public String code() {
		return "JUMPING";
	}

	@Override
	public String label() {
		return "Jumping";
	}

	@Override
	public List<CharacterAction> availableActions() {
		return List.of(CharacterAction.LAND);
	}

	@Override
	public TransitionResult onAction(CharacterAction action, String characterName) {
		return switch (action) {
			case LAND -> new TransitionResult(
				new IdleState(),
				true,
				characterName + " atterrit et repasse en Idle."
			);
			default -> new TransitionResult(
				this,
				false,
				action.label() + " est impossible pendant que " + characterName + " est en Jumping."
			);
		};
	}
}
