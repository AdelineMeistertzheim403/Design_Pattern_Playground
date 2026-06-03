package com.designpatternplayground.backend.demo.visitor.domain;

import java.util.List;
import java.util.Locale;

import com.designpatternplayground.backend.common.exception.InvalidPatternConfigurationException;

public enum VisitorTreePreset {

	ASSET_PACK(
		"ASSET_PACK",
		"Asset Pack",
		"Pack d assets avec textures, audio et build final. Ideal pour le comptage, la valeur et le scan."
	) {
		@Override
		public WorkspaceFolder buildRoot() {
			return new WorkspaceFolder(
				"root",
				"asset-pack",
				List.of(
					new WorkspaceFolder(
						"textures",
						"textures",
						List.of(
							new WorkspaceFile("hero", "hero.png", 18, false),
							new WorkspaceFile("boss", "boss.png", 26, false)
						)
					),
					new WorkspaceFolder(
						"audio",
						"audio",
						List.of(
							new WorkspaceFile("ambient", "ambient.ogg", 12, false),
							new WorkspaceFile("virus", "virus_payload.dll", 7, true)
						)
					),
					new WorkspaceFolder(
						"build",
						"build",
						List.of(
							new WorkspaceFile("manifest", "manifest.json", 3, false),
							new WorkspaceFile("notes", "release-notes.md", 2, false)
						)
					)
				)
			);
		}
	},
	TEAM_WORKSPACE(
		"TEAM_WORKSPACE",
		"Team Workspace",
		"Espace d equipe avec docs, source et opérations."
	) {
		@Override
		public WorkspaceFolder buildRoot() {
			return new WorkspaceFolder(
				"root",
				"workspace",
				List.of(
					new WorkspaceFolder(
						"docs",
						"docs",
						List.of(
							new WorkspaceFile("roadmap", "roadmap.md", 4, false),
							new WorkspaceFile("budget", "budget.xlsx", 9, false)
						)
					),
					new WorkspaceFolder(
						"src",
						"src",
						List.of(
							new WorkspaceFile("app", "App.jsx", 6, false),
							new WorkspaceFile("scanner", "scanner.jar", 5, true)
						)
					),
					new WorkspaceFolder(
						"ops",
						"ops",
						List.of(
							new WorkspaceFile("deploy", "deploy.sh", 3, false)
						)
					)
				)
			);
		}
	},
	MEDIA_ARCHIVE(
		"MEDIA_ARCHIVE",
		"Media Archive",
		"Archive de medias avec dossiers video, photo et exports."
	) {
		@Override
		public WorkspaceFolder buildRoot() {
			return new WorkspaceFolder(
				"root",
				"media-archive",
				List.of(
					new WorkspaceFolder(
						"video",
						"video",
						List.of(
							new WorkspaceFile("intro", "intro.mp4", 42, false),
							new WorkspaceFile("teaser", "teaser.mov", 29, false)
						)
					),
					new WorkspaceFolder(
						"photo",
						"photo",
						List.of(
							new WorkspaceFile("cover", "cover.png", 11, false),
							new WorkspaceFile("contact", "contact-sheet.pdf", 8, false)
						)
					),
					new WorkspaceFolder(
						"exports",
						"exports",
						List.of(
							new WorkspaceFile("package", "package.zip", 15, false),
							new WorkspaceFile("quarantine", "trojan-sample.bin", 6, true)
						)
					)
				)
			);
		}
	};

	private final String code;
	private final String label;
	private final String description;

	VisitorTreePreset(String code, String label, String description) {
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

	public abstract WorkspaceFolder buildRoot();

	public static VisitorTreePreset fromCode(String code) {
		for (VisitorTreePreset preset : values()) {
			if (preset.code.equals(code == null ? "" : code.trim().toUpperCase(Locale.ROOT))) {
				return preset;
			}
		}
		throw new InvalidPatternConfigurationException("Preset Visitor inconnu : " + code);
	}
}
