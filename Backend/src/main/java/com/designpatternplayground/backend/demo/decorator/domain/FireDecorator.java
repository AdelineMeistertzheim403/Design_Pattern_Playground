package com.designpatternplayground.backend.demo.decorator.domain;

public class FireDecorator extends CharacterDecorator {

	public FireDecorator(CharacterComponent component) {
		super(component);
	}

	@Override
	public String code() {
		return "FIRE";
	}

	@Override
	public String layerLabel() {
		return "FireDecorator";
	}

	@Override
	public String effectLabel() {
		return "Ajoute une aura offensive et des attaques enflammees.";
	}

	@Override
	protected int attackBonus() {
		return 6;
	}

	@Override
	protected int defenseBonus() {
		return 0;
	}

	@Override
	protected int speedBonus() {
		return 0;
	}

	@Override
	protected int controlBonus() {
		return 0;
	}
}
