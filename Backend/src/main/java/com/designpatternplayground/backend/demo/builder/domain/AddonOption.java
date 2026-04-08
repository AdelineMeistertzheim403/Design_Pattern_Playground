package com.designpatternplayground.backend.demo.builder.domain;

import java.util.Arrays;

import com.designpatternplayground.backend.common.exception.InvalidPatternConfigurationException;

public enum AddonOption {
	DEFENSE("DEFENSE", new BuildStats(0, 5, 1, 1)),
	MOBILITY("MOBILITY", new BuildStats(4, 0, 2, 2)),
	SUPPORT("SUPPORT", new BuildStats(1, 1, 4, 1));

	private final String code;
	private final BuildStats stats;

	AddonOption(String code, BuildStats stats) {
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
				case DEFENSE -> "Shield Plating";
				case MOBILITY -> "Booster Pack";
				case SUPPORT -> "Utility Rack";
			};
			case CHARACTER -> switch (this) {
				case DEFENSE -> "Bastion Guard";
				case MOBILITY -> "Dash Harness";
				case SUPPORT -> "Support Drone";
			};
			case HOUSE -> switch (this) {
				case DEFENSE -> "Defensive Tower";
				case MOBILITY -> "Garage Bridge";
				case SUPPORT -> "Workshop Garden";
			};
		};
	}

	public String detailFor(BuilderProductType productType, String buildName) {
		return switch (productType) {
			case CAR -> switch (this) {
				case DEFENSE -> buildName + " gagne des renforts protecteurs sans refaire toute la structure.";
				case MOBILITY -> buildName + " recoit un module de poussee pour mieux se projeter.";
				case SUPPORT -> buildName + " embarque de l outillage et du support sans casser la base.";
			};
			case CHARACTER -> switch (this) {
				case DEFENSE -> buildName + " recoit une couche defensive orientee tenue de ligne.";
				case MOBILITY -> buildName + " obtient de nouveaux outils de deplacement et de rythme.";
				case SUPPORT -> buildName + " est accompagne d un support qui elargit ses usages.";
			};
			case HOUSE -> switch (this) {
				case DEFENSE -> buildName + " ajoute une protection peripherique et un signal de solidite.";
				case MOBILITY -> buildName + " facilite les circulations avec un acces ou une annexe mobile.";
				case SUPPORT -> buildName + " etend ses usages avec un atelier ou une zone complementaire.";
			};
		};
	}

	public static AddonOption fromCode(String rawCode) {
		String normalized = rawCode == null ? "" : rawCode.trim().toUpperCase();

		return Arrays.stream(values())
			.filter(value -> value.code.equals(normalized))
			.findFirst()
			.orElseThrow(() -> new InvalidPatternConfigurationException("Module additionnel Builder inconnu : " + rawCode));
	}
}
