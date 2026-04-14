package com.designpatternplayground.backend.demo.iterator.domain;

import java.util.Arrays;
import java.util.List;

import com.designpatternplayground.backend.common.exception.InvalidPatternConfigurationException;

public enum IteratorCollectionPreset {

	QUEST_LOG(
		"QUEST_LOG",
		"Quest Log",
		"Une liste lineaire de missions a parcourir avec next() et previous().",
		"Traversal log stable",
		"Sans iterator, le retour arriere force une recalcul manuel de l index courant.",
		List.of(
			item("quest-intro", "Briefing", "ENTRY", 0, 0),
			item("quest-track", "Track target", "ENTRY", 0, 1),
			item("quest-breach", "Breach gate", "ENTRY", 0, 2),
			item("quest-extract", "Extract core", "ENTRY", 0, 3),
			item("quest-escape", "Escape route", "ENTRY", 0, 4)
		)
	),
	ASSET_TREE(
		"ASSET_TREE",
		"Asset Tree",
		"Un arbre aplati en parcours depth-first pour montrer qu un iterator peut cacher la structure de stockage.",
		"Depth-first traversal",
		"Sans iterator, revenir en arriere oblige a recalculer la position dans l arbre a partir du root.",
		List.of(
			item("root", "assets", "ROOT", 0, 0),
			item("folder-sprites", "sprites", "FOLDER", 1, 1),
			item("file-hero", "hero_idle.png", "FILE", 2, 2),
			item("file-enemy", "enemy_boss.png", "FILE", 2, 3),
			item("folder-audio", "audio", "FOLDER", 1, 4),
			item("file-ambient", "ambient_loop.ogg", "FILE", 2, 5),
			item("file-ui", "ui_click.wav", "FILE", 2, 6)
		)
	),
	TOOLBELT(
		"TOOLBELT",
		"Toolbelt",
		"Une ceinture d outils a parcourir dans les deux sens avec un curseur visuel unique.",
		"Bidirectional walk",
		"Sans iterator, le client garde lui-meme la position et finit vite par dupliquer la logique de navigation.",
		List.of(
			item("tool-map", "Map scanner", "TOOL", 0, 0),
			item("tool-hook", "Grapple hook", "TOOL", 0, 1),
			item("tool-drone", "Scout drone", "TOOL", 0, 2),
			item("tool-shield", "Pulse shield", "TOOL", 0, 3),
			item("tool-medkit", "Med kit", "TOOL", 0, 4)
		)
	);

	private final String code;
	private final String label;
	private final String description;
	private final String iteratorBenefit;
	private final String manualDriftDetail;
	private final List<IteratorItemSnapshot> items;

	IteratorCollectionPreset(
		String code,
		String label,
		String description,
		String iteratorBenefit,
		String manualDriftDetail,
		List<IteratorItemSnapshot> items
	) {
		this.code = code;
		this.label = label;
		this.description = description;
		this.iteratorBenefit = iteratorBenefit;
		this.manualDriftDetail = manualDriftDetail;
		this.items = items;
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

	public String iteratorBenefit() {
		return iteratorBenefit;
	}

	public String manualDriftDetail() {
		return manualDriftDetail;
	}

	public List<IteratorItemSnapshot> items() {
		return items;
	}

	public static IteratorCollectionPreset fromCode(String rawCode) {
		return Arrays.stream(values())
			.filter(preset -> preset.code.equalsIgnoreCase(rawCode))
			.findFirst()
			.orElseThrow(() -> new InvalidPatternConfigurationException(
				"Collection Iterator inconnue : " + rawCode
			));
	}

	private static IteratorItemSnapshot item(String id, String label, String kind, int depth, int linearIndex) {
		return new IteratorItemSnapshot(id, label, kind, depth, linearIndex);
	}
}
