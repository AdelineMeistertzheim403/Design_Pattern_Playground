package com.designpatternplayground.backend.demo.composite.domain;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;

import com.designpatternplayground.backend.common.exception.InvalidPatternConfigurationException;

public enum CompositeBlueprintProfile {

	GAME_ASSETS(
		"GAME_ASSETS",
		"Game Assets",
		"Arbre de production jeu avec dossiers sprites, audio et atlas UI.",
		"Une seule opération peut balayer tout le pack d assets quand les dossiers et fichiers partagent le même contrat.",
		"Sans Composite, le client oublie les sprites imbriqués dans player et ne traite que le premier niveau."
	),
	DESIGN_SYSTEM(
		"DESIGN_SYSTEM",
		"Design System",
		"Bibliotheque UI avec composants, tokens et document Storybook.",
		"Le root délègue la même opération a des branches hétérogènes sans if spéciaux.",
		"Sans Composite, les fichiers enfouis dans components et tokens restent hors du parcours manuel."
	),
	DOCS_SPACE(
		"DOCS_SPACE",
		"Docs Space",
		"Espace documentaire avec guides, API et readme central.",
		"Le même appel de traversal couvre guides, API et documents feuilles.",
		"Sans Composite, la documentation profonde n'est pas consolidee quand le client reste au niveau racine."
	);

	private final String code;
	private final String label;
	private final String description;
	private final String compositeBenefit;
	private final String manualGapDetail;

	CompositeBlueprintProfile(
		String code,
		String label,
		String description,
		String compositeBenefit,
		String manualGapDetail
	) {
		this.code = code;
		this.label = label;
		this.description = description;
		this.compositeBenefit = compositeBenefit;
		this.manualGapDetail = manualGapDetail;
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

	public String compositeBenefit() {
		return compositeBenefit;
	}

	public String manualGapDetail() {
		return manualGapDetail;
	}

	public List<CompositeNodeSnapshot> buildTree(String rootName, int extraLeafCount, boolean useComposite) {
		List<NodeSeed> seeds = new ArrayList<>();
		seeds.add(seed("root", null, rootName, "ROOT", 0, 0));

		switch (this) {
			case GAME_ASSETS -> addGameAssets(seeds, extraLeafCount);
			case DESIGN_SYSTEM -> addDesignSystem(seeds, extraLeafCount);
			case DOCS_SPACE -> addDocsSpace(seeds, extraLeafCount);
		}

		return seeds.stream()
			.map(seed -> new CompositeNodeSnapshot(
				seed.id(),
				seed.parentId(),
				seed.label(),
				seed.kind(),
				seed.depth(),
				seed.sizeMb(),
				useComposite || seed.depth() <= 1
			))
			.toList();
	}

	public static CompositeBlueprintProfile fromCode(String code) {
		return Arrays.stream(values())
			.filter(value -> value.code.equals(code == null ? "" : code.trim().toUpperCase(Locale.ROOT)))
			.findFirst()
			.orElseThrow(() -> new InvalidPatternConfigurationException("Blueprint Composite inconnu : " + code));
	}

	private void addGameAssets(List<NodeSeed> seeds, int extraLeafCount) {
		seeds.add(seed("sprites", "root", "sprites", "FOLDER", 1, 0));
		seeds.add(seed("audio", "root", "audio", "FOLDER", 1, 0));
		seeds.add(seed("ui-atlas", "root", "ui_atlas.png", "FILE", 1, 18));
		seeds.add(seed("player", "sprites", "player", "FOLDER", 2, 0));
		seeds.add(seed("enemies", "sprites", "enemies.png", "FILE", 2, 22));
		seeds.add(seed("ambient", "audio", "ambient.ogg", "FILE", 2, 34));
		seeds.add(seed("impact", "audio", "impact.wav", "FILE", 2, 8));
		seeds.add(seed("idle", "player", "hero_idle.png", "FILE", 3, 12));
		seeds.add(seed("run", "player", "hero_run.png", "FILE", 3, 14));

		for (int index = 1; index <= extraLeafCount; index++) {
			seeds.add(seed("variant-" + index, "player", "variant_" + index + ".png", "FILE", 3, 6 + index));
		}
	}

	private void addDesignSystem(List<NodeSeed> seeds, int extraLeafCount) {
		seeds.add(seed("components", "root", "components", "FOLDER", 1, 0));
		seeds.add(seed("tokens", "root", "tokens", "FOLDER", 1, 0));
		seeds.add(seed("storybook", "root", "storybook.mdx", "FILE", 1, 11));
		seeds.add(seed("button", "components", "Button.tsx", "FILE", 2, 7));
		seeds.add(seed("card", "components", "Card.tsx", "FILE", 2, 8));
		seeds.add(seed("colors", "tokens", "color.tokens.json", "FILE", 2, 5));
		seeds.add(seed("spacing", "tokens", "spacing.tokens.json", "FILE", 2, 4));

		for (int index = 1; index <= extraLeafCount; index++) {
			seeds.add(seed("widget-" + index, "components", "Widget" + index + ".tsx", "FILE", 2, 6 + index));
		}
	}

	private void addDocsSpace(List<NodeSeed> seeds, int extraLeafCount) {
		seeds.add(seed("guides", "root", "guides", "FOLDER", 1, 0));
		seeds.add(seed("api", "root", "api", "FOLDER", 1, 0));
		seeds.add(seed("readme", "root", "README.md", "FILE", 1, 3));
		seeds.add(seed("onboarding", "guides", "onboarding.md", "FILE", 2, 6));
		seeds.add(seed("architecture", "guides", "architecture.md", "FILE", 2, 9));
		seeds.add(seed("auth", "api", "auth.md", "FILE", 2, 5));
		seeds.add(seed("patterns", "api", "patterns.md", "FILE", 2, 7));

		for (int index = 1; index <= extraLeafCount; index++) {
			seeds.add(seed("appendix-" + index, "guides", "appendix-" + index + ".md", "FILE", 2, 2 + index));
		}
	}

	private static NodeSeed seed(String id, String parentId, String label, String kind, int depth, int sizeMb) {
		return new NodeSeed(id, parentId, label, kind, depth, sizeMb);
	}

	private record NodeSeed(
		String id,
		String parentId,
		String label,
		String kind,
		int depth,
		int sizeMb
	) {
	}
}
