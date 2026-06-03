package com.designpatternplayground.backend.demo.decorator.domain;

public class SpeedDecorator extends CharacterDecorator {

	public SpeedDecorator(CharacterComponent component) {
		super(component);
	}

	@Override
	public String code() {
		return "SPEED";
	}

	@Override
	public String layerLabel() {
		return "SpeedDecorator";
	}

	@Override
	public String effectLabel() {
		return "Ajoute un buff de mobilité visible immédiatement dans les stats.";
	}

	@Override
	protected int attackBonus() {
		return 0;
	}

	@Override
	protected int defenseBonus() {
		return 0;
	}

	@Override
	protected int speedBonus() {
		return 5;
	}

	@Override
	protected int controlBonus() {
		return 0;
	}
}
