package com.designpatternplayground.backend.demo.state.domain;

import java.util.List;

public class AttackingState implements CharacterState {

	@Override
	public String code() {
		return "ATTACKING";
	}

	@Override
	public String label() {
		return "Attacking";
	}

	@Override
	public List<CharacterAction> availableActions() {
		return List.of(CharacterAction.FINISH_ATTACK);
	}

	@Override
	public TransitionResult onAction(CharacterAction action, String characterName) {
		return switch (action) {
			case FINISH_ATTACK -> new TransitionResult(
				new IdleState(),
				true,
				characterName + " termine son attaque et revient en Idle."
			);
			default -> new TransitionResult(
				this,
				false,
				action.label() + " est ignoree tant que " + characterName + " est en Attacking."
			);
		};
	}
}
