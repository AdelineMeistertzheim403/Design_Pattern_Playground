package com.designpatternplayground.backend.demo.decorator.domain;

import java.util.List;

public interface CharacterComponent {

	String characterName();

	HeroArchetype archetype();

	CharacterStats stats();

	List<String> activeEffects();
}
