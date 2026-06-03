package com.designpatternplayground.backend.demo.decorator.domain;

import java.util.Locale;

import com.designpatternplayground.backend.common.exception.InvalidPatternConfigurationException;

public enum HeroArchetype {

	WARRIOR(
		"WARRIOR",
		"Guardian Knight",
		"Profil equilibre oriente defense, ideal pour montrer une base stable avant decoration.",
		new CharacterStats(10, 8, 4, 2)
	),
	MAGE(
		"MAGE",
		"Arcane Weaver",
		"Profil technique avec beaucoup de contrôle, utile pour visualiser les effets élémentaires.",
		new CharacterStats(8, 4, 5, 9)
	),
	ROGUE(
		"ROGUE",
		"Shadow Runner",
		"Profil mobile et offensif, tres lisible quand on empile vitesse et effets de burst.",
		new CharacterStats(9, 5, 8, 3)
	);

	private final String code;
	private final String label;
	private final String flavorText;
	private final CharacterStats baseStats;

	HeroArchetype(String code, String label, String flavorText, CharacterStats baseStats) {
		this.code = code;
		this.label = label;
		this.flavorText = flavorText;
		this.baseStats = baseStats;
	}

	public String code() {
		return code;
	}

	public String label() {
		return label;
	}

	public String flavorText() {
		return flavorText;
	}

	public CharacterStats baseStats() {
		return baseStats;
	}

	public static HeroArchetype fromCode(String rawCode) {
		if (rawCode == null || rawCode.isBlank()) {
			throw new InvalidPatternConfigurationException("baseType est obligatoire.");
		}

		String normalized = rawCode.trim().toUpperCase(Locale.ROOT);

		for (HeroArchetype archetype : values()) {
			if (archetype.code.equals(normalized)) {
				return archetype;
			}
		}

		throw new InvalidPatternConfigurationException("Type de personnage inconnu : " + rawCode);
	}
}
