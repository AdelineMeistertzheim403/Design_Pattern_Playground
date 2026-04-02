package com.designpatternplayground.backend.demo.decorator.domain;

public class IceDecorator extends CharacterDecorator {

	public IceDecorator(CharacterComponent component) {
		super(component);
	}

	@Override
	public String code() {
		return "ICE";
	}

	@Override
	public String layerLabel() {
		return "IceDecorator";
	}

	@Override
	public String effectLabel() {
		return "Ajoute du controle de zone et renforce legerement l offense et la defense.";
	}

	@Override
	protected int attackBonus() {
		return 4;
	}

	@Override
	protected int defenseBonus() {
		return 4;
	}

	@Override
	protected int speedBonus() {
		return 0;
	}

	@Override
	protected int controlBonus() {
		return 5;
	}
}
