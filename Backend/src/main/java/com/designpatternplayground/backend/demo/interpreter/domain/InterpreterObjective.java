package com.designpatternplayground.backend.demo.interpreter.domain;

import java.util.Locale;
import java.util.Map;

import com.designpatternplayground.backend.common.exception.InvalidPatternConfigurationException;

public record InterpreterObjective(
	String code,
	String label,
	String description,
	String targetLabel,
	int targetX,
	int targetY,
	boolean requiresAttack
) {

	private static final Map<String, InterpreterObjective> OBJECTIVES = Map.of(
		"TARGET_DUMMY",
		new InterpreterObjective(
			"TARGET_DUMMY",
			"Target Dummy",
			"Atteindre le mannequin d entrainement puis déclencher une attaque au bon endroit.",
			"Dummy",
			4,
			3,
			true
		),
		"RELAY_BEACON",
		new InterpreterObjective(
			"RELAY_BEACON",
			"Relay Beacon",
			"Rejoindre la balise de relais pour synchroniser le parcours sans attaque finale.",
			"Beacon",
			5,
			2,
			false
		),
		"GATE_SWITCH",
		new InterpreterObjective(
			"GATE_SWITCH",
			"Gate Switch",
			"Déclencher le levier final dans la partie basse de l arene.",
			"Switch",
			3,
			5,
			false
		)
	);

	public static InterpreterObjective fromCode(String code) {
		InterpreterObjective objective = OBJECTIVES.get(code == null ? "" : code.trim().toUpperCase(Locale.ROOT));
		if (objective == null) {
			throw new InvalidPatternConfigurationException("Objectif Interpreter inconnu : " + code);
		}
		return objective;
	}
}
