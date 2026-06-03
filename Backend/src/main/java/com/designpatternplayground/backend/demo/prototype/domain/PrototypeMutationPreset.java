package com.designpatternplayground.backend.demo.prototype.domain;

import java.util.Locale;
import java.util.Map;

import com.designpatternplayground.backend.common.exception.InvalidPatternConfigurationException;

public record PrototypeMutationPreset(
	String code,
	String label,
	String detail,
	String colorHex,
	String effectLabel,
	String syncKey,
	int bonusAttack,
	int bonusDefense,
	int bonusSpeed
) {

	private static final Map<String, PrototypeMutationPreset> PRESETS = Map.of(
		"OVERCLOCK",
		new PrototypeMutationPreset(
			"OVERCLOCK",
			"Overclock Burst",
			"Pousse le coeur clone dans un mode agressif. Ideal pour voir si l'état imbriqué se propage.",
			"#cf5c3b",
			"salve plasma",
			"burst-red",
			5,
			0,
			3
		),
		"FORTIFY",
		new PrototypeMutationPreset(
			"FORTIFY",
			"Fortify Shield",
			"Renforce l enveloppe defensive du module pour observer un partage de configuration protectrice.",
			"#426c8d",
			"bouclier sync",
			"guard-blue",
			0,
			5,
			1
		),
		"STEALTH",
		new PrototypeMutationPreset(
			"STEALTH",
			"Stealth Veil",
			"Injecte un profil de furtivite et de vitesse dans le coeur du clone cible.",
			"#246b5e",
			"brume furtive",
			"ghost-green",
			1,
			1,
			5
		)
	);

	public static PrototypeMutationPreset fromCode(String code) {
		PrototypeMutationPreset preset = PRESETS.get(code.toUpperCase(Locale.ROOT));
		if (preset == null) {
			throw new InvalidPatternConfigurationException("Preset Prototype inconnu : " + code);
		}

		return preset;
	}
}
