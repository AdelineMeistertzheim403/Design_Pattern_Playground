package com.designpatternplayground.backend.demo.bridge.domain;

import java.util.List;

public record BridgeShapePreset(
	String code,
	String label,
	String abstractionClassName,
	String detail,
	int baseComplexity
) {

	private static final List<BridgeShapePreset> PRESETS = List.of(
		new BridgeShapePreset(
			"CIRCLE",
			"Circle",
			"CircleShape",
			"Une forme ronde utile pour montrer que le rendu change sans toucher aux opérations de la forme.",
			2
		),
		new BridgeShapePreset(
			"TRIANGLE",
			"Triangle",
			"TriangleShape",
			"Une forme plus anguleuse qui garde les mêmes commandes mais change d implémentation visuelle.",
			3
		),
		new BridgeShapePreset(
			"BANNER",
			"Banner",
			"BannerShape",
			"Une abstraction plus large, proche d'un widget ou d'une couche UI, ideale pour voir la variation de moteur.",
			4
		)
	);

	public static BridgeShapePreset fromCode(String code) {
		return PRESETS.stream()
			.filter(preset -> preset.code().equalsIgnoreCase(code))
			.findFirst()
			.orElse(PRESETS.get(0));
	}
}
