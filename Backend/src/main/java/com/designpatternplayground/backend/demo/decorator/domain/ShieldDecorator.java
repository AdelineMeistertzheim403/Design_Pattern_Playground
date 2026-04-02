package com.designpatternplayground.backend.demo.decorator.domain;

public class ShieldDecorator extends CharacterDecorator {

	public ShieldDecorator(CharacterComponent component) {
		super(component);
	}

	@Override
	public String code() {
		return "SHIELD";
	}

	@Override
	public String layerLabel() {
		return "ShieldDecorator";
	}

	@Override
	public String effectLabel() {
		return "Ajoute une surcouche defensive sans toucher au composant de base.";
	}

	@Override
	protected int attackBonus() {
		return 0;
	}

	@Override
	protected int defenseBonus() {
		return 10;
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
