package com.designpatternplayground.backend.demo.builder.domain;

import java.util.Arrays;

import com.designpatternplayground.backend.common.exception.InvalidPatternConfigurationException;

public enum BuilderProductType {
	CAR(
		"CAR",
		"Voiture",
		"Assemble un vehicule personnalisable couche par couche dans un atelier visuel."
	),
	CHARACTER(
		"CHARACTER",
		"Personnage",
		"Assemble un hero modulaire avec equipement, support et finition."
	),
	HOUSE(
		"HOUSE",
		"Maison",
		"Assemble une maison progressive en posant structure, energie, extension et facade."
	);

	private final String code;
	private final String label;
	private final String description;

	BuilderProductType(String code, String label, String description) {
		this.code = code;
		this.label = label;
		this.description = description;
	}

	public String code() {
		return code;
	}

	public String label() {
		return label;
	}

	public String description() {
		return description;
	}

	public String silhouetteStageLabel() {
		return switch (this) {
			case CAR -> "Chassis";
			case CHARACTER -> "Silhouette";
			case HOUSE -> "Structure";
		};
	}

	public String coreStageLabel() {
		return switch (this) {
			case CAR -> "Motorisation";
			case CHARACTER -> "Noyau de role";
			case HOUSE -> "Noyau technique";
		};
	}

	public String addonStageLabel() {
		return switch (this) {
			case CAR -> "Module";
			case CHARACTER -> "Accessoire";
			case HOUSE -> "Extension";
		};
	}

	public String finishStageLabel() {
		return switch (this) {
			case CAR -> "Finition";
			case CHARACTER -> "Aura finale";
			case HOUSE -> "Facade finale";
		};
	}

	public String monolithicClassName() {
		return switch (this) {
			case CAR -> "CarPreset";
			case CHARACTER -> "HeroPreset";
			case HOUSE -> "HousePreset";
		};
	}

	public static BuilderProductType fromCode(String rawCode) {
		String normalized = rawCode == null ? "" : rawCode.trim().toUpperCase();

		return Arrays.stream(values())
			.filter(value -> value.code.equals(normalized))
			.findFirst()
			.orElseThrow(() -> new InvalidPatternConfigurationException("Type de produit Builder inconnu : " + rawCode));
	}
}
