package com.designpatternplayground.backend.demo.state.domain;

import java.util.List;

public class IdleState implements CharacterState {

	@Override
	public String code() {
		return "IDLE";
	}

	@Override
	public String label() {
		return "Idle";
	}

	@Override
	public List<CharacterAction> availableActions() {
		return List.of(CharacterAction.START_RUN, CharacterAction.JUMP, CharacterAction.ATTACK);
	}

	@Override
	public TransitionResult onAction(CharacterAction action, String characterName) {
		return switch (action) {
			case START_RUN -> new TransitionResult(
				new RunningState(),
				true,
				characterName + " quitte Idle et passe en Running."
			);
			case JUMP -> new TransitionResult(
				new JumpingState(),
				true,
				characterName + " saute depuis Idle et entre en Jumping."
			);
			case ATTACK -> new TransitionResult(
				new AttackingState(),
				true,
				characterName + " declenche une attaque depuis Idle."
			);
			default -> new TransitionResult(
				this,
				false,
				action.label() + " ne produit rien tant que " + characterName + " est en Idle."
			);
		};
	}
}
