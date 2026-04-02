package com.designpatternplayground.backend.demo.decorator.domain;

public record CharacterStats(
	int attack,
	int defense,
	int speed,
	int control
) {

	public CharacterStats add(int attackBonus, int defenseBonus, int speedBonus, int controlBonus) {
		return new CharacterStats(
			attack + attackBonus,
			defense + defenseBonus,
			speed + speedBonus,
			control + controlBonus
		);
	}
}
