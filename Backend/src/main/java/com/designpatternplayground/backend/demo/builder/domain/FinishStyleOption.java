package com.designpatternplayground.backend.demo.builder.domain;

import java.util.Arrays;

import com.designpatternplayground.backend.common.exception.InvalidPatternConfigurationException;

public enum FinishStyleOption {
	CLASSIC("CLASSIC", new BuildStats(0, 1, 1, 2)),
	NEON("NEON", new BuildStats(1, 0, 1, 4)),
	ECO("ECO", new BuildStats(0, 1, 2, 3));

	private final String code;
	private final BuildStats stats;

	FinishStyleOption(String code, BuildStats stats) {
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
				case CLASSIC -> "Classic Paint";
				case NEON -> "Neon Livery";
				case ECO -> "Eco Trim";
			};
			case CHARACTER -> switch (this) {
				case CLASSIC -> "Heritage Cape";
				case NEON -> "Neon Aura";
				case ECO -> "Verdant Aura";
			};
			case HOUSE -> switch (this) {
				case CLASSIC -> "Traditional Facade";
				case NEON -> "Neon Facade";
				case ECO -> "Eco Facade";
			};
		};
	}

	public String detailFor(BuilderProductType productType, String buildName) {
		return switch (productType) {
			case CAR -> switch (this) {
				case CLASSIC -> "La finition classique donne a " + buildName + " une lecture immédiate et rassurante.";
				case NEON -> "La finition neon rend " + buildName + " spectaculaire et tres lisible en demo.";
				case ECO -> "La finition eco met en avant la sobriete et les usages durables.";
			};
			case CHARACTER -> switch (this) {
				case CLASSIC -> buildName + " termine son build sur un rendu héroïque et lisible.";
				case NEON -> buildName + " se ferme sur une aura vive qui dramatise le profil.";
				case ECO -> buildName + " obtient une identité plus organique et durable.";
			};
			case HOUSE -> switch (this) {
				case CLASSIC -> buildName + " affiche une facade lisible et intemporelle.";
				case NEON -> buildName + " assume une facade expressive et plus audacieuse.";
				case ECO -> buildName + " conclut son chantier avec une facade orientee durabilite.";
			};
		};
	}

	public static FinishStyleOption fromCode(String rawCode) {
		String normalized = rawCode == null ? "" : rawCode.trim().toUpperCase();

		return Arrays.stream(values())
			.filter(value -> value.code.equals(normalized))
			.findFirst()
			.orElseThrow(() -> new InvalidPatternConfigurationException("Finition Builder inconnue : " + rawCode));
	}
}
