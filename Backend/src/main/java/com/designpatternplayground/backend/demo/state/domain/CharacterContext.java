package com.designpatternplayground.backend.demo.state.domain;

public class CharacterContext {

	private final String characterName;
	private CharacterState currentState;

	public CharacterContext(String characterName, CharacterState initialState) {
		this.characterName = characterName;
		this.currentState = initialState;
	}

	public StateTransitionStep dispatch(CharacterAction action, int index) {
		CharacterState previousState = currentState;
		TransitionResult result = currentState.onAction(action, characterName);
		currentState = result.nextState();

		return new StateTransitionStep(
			index,
			action.code(),
			action.label(),
			previousState.code(),
			currentState.code(),
			result.accepted(),
			result.detail()
		);
	}

	public CharacterState currentState() {
		return currentState;
	}
}
