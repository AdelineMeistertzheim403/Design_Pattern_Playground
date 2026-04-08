package com.designpatternplayground.backend.demo.builder.domain;

import java.util.Arrays;

import com.designpatternplayground.backend.common.exception.InvalidPatternConfigurationException;

public enum SilhouetteOption {
	COMPACT("COMPACT", new BuildStats(5, 1, 2, 2)),
	BALANCED("BALANCED", new BuildStats(3, 3, 3, 2)),
	GRAND("GRAND", new BuildStats(1, 5, 4, 3));

	private final String code;
	private final BuildStats stats;

	SilhouetteOption(String code, BuildStats stats) {
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
				case COMPACT -> "Sprint Chassis";
				case BALANCED -> "Touring Frame";
				case GRAND -> "Titan Chassis";
			};
			case CHARACTER -> switch (this) {
				case COMPACT -> "Agile Silhouette";
				case BALANCED -> "Balanced Stance";
				case GRAND -> "Guardian Bulk";
			};
			case HOUSE -> switch (this) {
				case COMPACT -> "Plan Compact";
				case BALANCED -> "Pavillon Familial";
				case GRAND -> "Manoir Panorama";
			};
		};
	}

	public String detailFor(BuilderProductType productType, String buildName) {
		return switch (productType) {
			case CAR -> switch (this) {
				case COMPACT -> buildName + " recoit un chassis court et nerveux, ideal pour l agilite.";
				case BALANCED -> buildName + " prend un gabarit polyvalent facile a faire evoluer.";
				case GRAND -> buildName + " adopte une base large, stable et orientee capacite.";
			};
			case CHARACTER -> switch (this) {
				case COMPACT -> buildName + " commence comme un profil rapide axe esquive et initiative.";
				case BALANCED -> buildName + " demarre sur un profil souple qui ne sacrifie aucun axe.";
				case GRAND -> buildName + " nait avec une stature massive tailee pour tenir la ligne.";
			};
			case HOUSE -> switch (this) {
				case COMPACT -> buildName + " pose une emprise reduite et un plan court a optimiser.";
				case BALANCED -> buildName + " se construit sur une base habitable bien repartie.";
				case GRAND -> buildName + " lance une fondation ample destinee a porter plus d usages.";
			};
		};
	}

	public static SilhouetteOption fromCode(String rawCode) {
		String normalized = rawCode == null ? "" : rawCode.trim().toUpperCase();

		return Arrays.stream(values())
			.filter(value -> value.code.equals(normalized))
			.findFirst()
			.orElseThrow(() -> new InvalidPatternConfigurationException("Silhouette Builder inconnue : " + rawCode));
	}
}
