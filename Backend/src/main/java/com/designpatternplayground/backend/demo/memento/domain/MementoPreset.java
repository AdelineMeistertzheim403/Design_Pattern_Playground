package com.designpatternplayground.backend.demo.memento.domain;

import java.util.List;

public record MementoPreset(
	String code,
	String label,
	String description,
	String rewindBenefit,
	String manualDriftDetail,
	MementoWorkspaceState initialState
) {

	private static final List<MementoPreset> PRESETS = List.of(
		new MementoPreset(
			"PIXEL_GARDEN",
			"Pixel Garden",
			"Une scène colorisee avec couches, annotations et niveau d énergie a restaurer pendant un rewind.",
			"Le caretaker conserve des instantanés complets et l originator revient exactement a l'état capturé.",
			"Sans Memento, le client tente un retour arrière avec des notes partielles : quelques valeurs reviennent, mais l'état global dérive.",
			new MementoWorkspaceState("Pixel Garden", "Mint Bloom", 68, 3, 2, "Stable")
		),
		new MementoPreset(
			"ARCADE_HUB",
			"Arcade Hub",
			"Un hub neon qui accumule overlays et alertes pendant la session de jeu.",
			"Chaque savepoint capturé le hub complet avant une mutation risquee.",
			"Le retour manuel ne restaure qu'une partie du hub et laisse des compteurs dans un état hybride.",
			new MementoWorkspaceState("Arcade Hub", "Neon Pulse", 72, 4, 1, "Online")
		),
		new MementoPreset(
			"CONTROL_ROOM",
			"Control Room",
			"Une salle de contrôle dont les couches, l énergie et les marqueurs changent vite en phase d incident.",
			"Le snapshot protège la salle de contrôle et permet un retour net vers un checkpoint sain.",
			"Le replay manuel oublie des morceaux de contexte et la salle revient dans un état incoherent.",
			new MementoWorkspaceState("Control Room", "Amber Grid", 76, 5, 3, "Monitoring")
		)
	);

	public static MementoPreset fromCode(String code) {
		return PRESETS.stream()
			.filter(preset -> preset.code().equalsIgnoreCase(code))
			.findFirst()
			.orElse(PRESETS.get(0));
	}
}
