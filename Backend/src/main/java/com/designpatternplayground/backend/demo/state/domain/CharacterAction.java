package com.designpatternplayground.backend.demo.state.domain;

import java.util.Locale;

import com.designpatternplayground.backend.common.exception.InvalidPatternConfigurationException;

public enum CharacterAction {

	START_RUN("START_RUN", "Courir"),
	STOP("STOP", "Stop"),
	JUMP("JUMP", "Sauter"),
	LAND("LAND", "Atterrir"),
	ATTACK("ATTACK", "Attaquer"),
	FINISH_ATTACK("FINISH_ATTACK", "Fin attaque");

	private final String code;
	private final String label;

	CharacterAction(String code, String label) {
		this.code = code;
		this.label = label;
	}

	public String code() {
		return code;
	}

	public String label() {
		return label;
	}

	public static CharacterAction fromCode(String rawCode) {
		if (rawCode == null || rawCode.isBlank()) {
			throw new InvalidPatternConfigurationException("Chaque action doit etre renseignee.");
		}

		String normalized = rawCode.trim().toUpperCase(Locale.ROOT);

		for (CharacterAction action : values()) {
			if (action.code.equals(normalized)) {
				return action;
			}
		}

		throw new InvalidPatternConfigurationException("Action inconnue : " + rawCode);
	}
}
