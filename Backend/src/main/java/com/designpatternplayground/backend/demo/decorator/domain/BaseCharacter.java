package com.designpatternplayground.backend.demo.decorator.domain;

import java.util.List;

public class BaseCharacter implements CharacterComponent {

	private final String characterName;
	private final HeroArchetype archetype;

	public BaseCharacter(String characterName, HeroArchetype archetype) {
		this.characterName = characterName;
		this.archetype = archetype;
	}

	@Override
	public String characterName() {
		return characterName;
	}

	@Override
	public HeroArchetype archetype() {
		return archetype;
	}

	@Override
	public CharacterStats stats() {
		return archetype.baseStats();
	}

	@Override
	public List<String> activeEffects() {
		return List.of("Socle de base " + archetype.label());
	}
}
