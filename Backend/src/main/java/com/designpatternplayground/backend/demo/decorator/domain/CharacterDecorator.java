package com.designpatternplayground.backend.demo.decorator.domain;

import java.util.ArrayList;
import java.util.List;

public abstract class CharacterDecorator implements CharacterComponent {

	private final CharacterComponent component;

	protected CharacterDecorator(CharacterComponent component) {
		this.component = component;
	}

	public CharacterComponent wrapped() {
		return component;
	}

	public abstract String code();

	public abstract String layerLabel();

	public abstract String effectLabel();

	protected abstract int attackBonus();

	protected abstract int defenseBonus();

	protected abstract int speedBonus();

	protected abstract int controlBonus();

	@Override
	public String characterName() {
		return component.characterName();
	}

	@Override
	public HeroArchetype archetype() {
		return component.archetype();
	}

	@Override
	public CharacterStats stats() {
		return component.stats().add(
			attackBonus(),
			defenseBonus(),
			speedBonus(),
			controlBonus()
		);
	}

	@Override
	public List<String> activeEffects() {
		List<String> effects = new ArrayList<>(component.activeEffects());
		effects.add(effectLabel());
		return List.copyOf(effects);
	}
}
