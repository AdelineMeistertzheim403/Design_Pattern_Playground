package com.designpatternplayground.backend.demo.state.domain;

import java.util.List;

public class RunningState implements CharacterState {

	@Override
	public String code() {
		return "RUNNING";
	}

	@Override
	public String label() {
		return "Running";
	}

	@Override
	public List<CharacterAction> availableActions() {
		return List.of(CharacterAction.STOP, CharacterAction.JUMP, CharacterAction.ATTACK);
	}

	@Override
	public TransitionResult onAction(CharacterAction action, String characterName) {
		return switch (action) {
			case STOP -> new TransitionResult(
				new IdleState(),
				true,
				characterName + " s arrete et revient en Idle."
			);
			case JUMP -> new TransitionResult(
				new JumpingState(),
				true,
				characterName + " saute en gardant son elan et passe en Jumping."
			);
			case ATTACK -> new TransitionResult(
				new AttackingState(),
				true,
				characterName + " interrompt sa course pour attaquer."
			);
			default -> new TransitionResult(
				this,
				false,
				action.label() + " est ignoree tant que " + characterName + " est en Running."
			);
		};
	}
}
