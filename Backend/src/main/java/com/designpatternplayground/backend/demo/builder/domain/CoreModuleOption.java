package com.designpatternplayground.backend.demo.builder.domain;

import java.util.Arrays;

import com.designpatternplayground.backend.common.exception.InvalidPatternConfigurationException;

public enum CoreModuleOption {
	ELECTRIC("ELECTRIC", new BuildStats(4, 1, 4, 2)),
	ARCANE("ARCANE", new BuildStats(2, 2, 5, 4)),
	SOLAR("SOLAR", new BuildStats(1, 3, 4, 5));

	private final String code;
	private final BuildStats stats;

	CoreModuleOption(String code, BuildStats stats) {
		this.code = code;
		this.stats = stats;
	}

	public String code() {
		return code;
	}

	public BuildStats stats() {
		return stats;
	}

	public String labelFor(BuilderProductType productType) {
		return switch (productType) {
			case CAR -> switch (this) {
				case ELECTRIC -> "Electric Engine";
				case ARCANE -> "Arcane Turbine";
				case SOLAR -> "Solar Roof Core";
			};
			case CHARACTER -> switch (this) {
				case ELECTRIC -> "Volt Arsenal";
				case ARCANE -> "Arcane Focus";
				case SOLAR -> "Solar Totem";
			};
			case HOUSE -> switch (this) {
				case ELECTRIC -> "Battery Core";
				case ARCANE -> "Arcane Hearth";
				case SOLAR -> "Solar Atrium";
			};
		};
	}

	public String detailFor(BuilderProductType productType, String buildName) {
		return switch (productType) {
			case CAR -> switch (this) {
				case ELECTRIC -> "Le moteur electrique donne a " + buildName + " des reprises propres et une bonne utilite.";
				case ARCANE -> "La turbine arcane pousse " + buildName + " vers un profil plus spectaculaire et technique.";
				case SOLAR -> "Le coeur solaire augmente l autonomie et l identite visuelle du vehicule.";
			};
			case CHARACTER -> switch (this) {
				case ELECTRIC -> "Le noyau electrique arme " + buildName + " pour des engagements rapides.";
				case ARCANE -> "Le focus arcane ouvre des capacites de controle et de polyvalence.";
				case SOLAR -> "Le totem solaire stabilise " + buildName + " et renforce son aura.";
			};
			case HOUSE -> switch (this) {
				case ELECTRIC -> "Le coeur batterie apporte un socle technique compact et pratique.";
				case ARCANE -> "L atre arcane transforme " + buildName + " en maison experientielle et expressive.";
				case SOLAR -> "L atrium solaire augmente l autonomie et la signature architecturale.";
			};
		};
	}

	public static CoreModuleOption fromCode(String rawCode) {
		String normalized = rawCode == null ? "" : rawCode.trim().toUpperCase();

		return Arrays.stream(values())
			.filter(value -> value.code.equals(normalized))
			.findFirst()
			.orElseThrow(() -> new InvalidPatternConfigurationException("Module central Builder inconnu : " + rawCode));
	}
}
