package com.designpatternplayground.backend.demo.command.domain;

import java.util.Locale;

import com.designpatternplayground.backend.common.exception.InvalidPatternConfigurationException;

public enum CommandAction {

	ADD_BEACON("ADD_BEACON", "Ajouter balise", false),
	MOVE_RIGHT("MOVE_RIGHT", "Deplacer a droite", false),
	MOVE_UP("MOVE_UP", "Monter", false),
	MOVE_LEFT("MOVE_LEFT", "Deplacer a gauche", false),
	DELETE_BEACON("DELETE_BEACON", "Supprimer balise", false),
	UNDO("UNDO", "Undo", true),
	REDO("REDO", "Redo", true);

	private final String code;
	private final String label;
	private final boolean controlAction;

	CommandAction(String code, String label, boolean controlAction) {
		this.code = code;
		this.label = label;
		this.controlAction = controlAction;
	}

	public String code() {
		return code;
	}

	public String label() {
		return label;
	}

	public boolean controlAction() {
		return controlAction;
	}

	public static CommandAction fromCode(String rawCode) {
		if (rawCode == null || rawCode.isBlank()) {
			throw new InvalidPatternConfigurationException("Chaque action doit etre renseignee.");
		}

		String normalized = rawCode.trim().toUpperCase(Locale.ROOT);

		for (CommandAction action : values()) {
			if (action.code.equals(normalized)) {
				return action;
			}
		}

		throw new InvalidPatternConfigurationException("Action Command inconnue : " + rawCode);
	}
}
