package com.designpatternplayground.backend.demo.bridge.domain;

import java.util.List;

public record BridgeRenderPreset(
	String code,
	String label,
	String engineClassName,
	String renderStyle,
	String bridgeBenefit
) {

	private static final List<BridgeRenderPreset> PRESETS = List.of(
		new BridgeRenderPreset(
			"VECTOR_ENGINE",
			"Vector Engine",
			"VectorRenderEngine",
			"Contours nets, lignes propres et rendu lisible sur toutes les tailles.",
			"L abstraction garde la même forme pendant que l implémentation change proprement de moteur."
		),
		new BridgeRenderPreset(
			"PIXEL_ENGINE",
			"Pixel Engine",
			"PixelRenderEngine",
			"Blocs retro, grille marquee et rendu arcade a faible resolution.",
			"Bridge injecte un moteur retro sans reecrire la logique métier de la forme."
		),
		new BridgeRenderPreset(
			"GLOW_ENGINE",
			"Glow Engine",
			"GlowRenderEngine",
			"Aura lumineuse, halo dynamique et accent fort sur la presence visuelle.",
			"Une nouvelle implémentation se branche sans exploser le nombre de sous-classes."
		)
	);

	public static BridgeRenderPreset fromCode(String code) {
		return PRESETS.stream()
			.filter(preset -> preset.code().equalsIgnoreCase(code))
			.findFirst()
			.orElse(PRESETS.get(0));
	}
}
