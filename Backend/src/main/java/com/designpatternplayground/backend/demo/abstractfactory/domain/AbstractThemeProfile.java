package com.designpatternplayground.backend.demo.abstractfactory.domain;

import java.util.List;
import java.util.Locale;

import com.designpatternplayground.backend.common.exception.InvalidPatternConfigurationException;

public record AbstractThemeProfile(
	String code,
	String label,
	String factoryClassName,
	String familyLabel,
	String moodLabel,
	String driftThemeLabel,
	ThemeArtifact hero,
	ThemeArtifact transport,
	ThemeArtifact relic,
	ThemeArtifact driftArtifact
) {

	public static final AbstractThemeProfile SCI_FI = new AbstractThemeProfile(
		"SCI_FI",
		"Sci-Fi",
		"SciFiThemeFactory",
		"Neon strike pack",
		"Neon, metal et interfaces holographiques.",
		"Medieval",
		new ThemeArtifact(
			"HERO",
			"Hero",
			"SpacePilot",
			"Nova Pilot",
			"Pilote tactique concu pour des environnements orbitaux et des missions a haute vitesse."
		),
		new ThemeArtifact(
			"TRANSPORT",
			"Transport",
			"HoverBike",
			"Pulse Hoverbike",
			"Vehicule leger a sustentation magnetique parfait pour garder une silhouette futuriste coherente."
		),
		new ThemeArtifact(
			"RELIC",
			"Relic",
			"PlasmaRelic",
			"Quantum Core",
			"Artefact lumineux qui alimente l univers visuel et le gameplay du theme."
		),
		new ThemeArtifact(
			"TRANSPORT",
			"Transport",
			"WarHorse",
			"Iron Warhorse",
			"Monture lourde issue d un autre univers. Elle casse immediatement la coherence de famille."
		)
	);

	public static final AbstractThemeProfile MEDIEVAL = new AbstractThemeProfile(
		"MEDIEVAL",
		"Medieval",
		"MedievalThemeFactory",
		"Castle defense pack",
		"Pierre, cuir, bannieres et artisanat heroique.",
		"Sci-Fi",
		new ThemeArtifact(
			"HERO",
			"Hero",
			"KnightChampion",
			"Knight Champion",
			"Champion de melee bati pour les remparts, les parades et le duel frontal."
		),
		new ThemeArtifact(
			"TRANSPORT",
			"Transport",
			"WarHorse",
			"Iron Warhorse",
			"Monture blindee qui garde la famille medievale lisible et homogene."
		),
		new ThemeArtifact(
			"RELIC",
			"Relic",
			"RunicBanner",
			"Runic Banner",
			"Relique de commandement qui porte les couleurs et la magie du royaume."
		),
		new ThemeArtifact(
			"TRANSPORT",
			"Transport",
			"HoverBike",
			"Pulse Hoverbike",
			"Vehicule a sustentation venu d un autre theme. Il cree une rupture immediate dans la famille d objets."
		)
	);

	public static AbstractThemeProfile fromCode(String rawCode) {
		if (rawCode == null || rawCode.isBlank()) {
			return SCI_FI;
		}

		return switch (rawCode.trim().toUpperCase(Locale.ROOT)) {
			case "SCI_FI" -> SCI_FI;
			case "MEDIEVAL" -> MEDIEVAL;
			default -> throw new InvalidPatternConfigurationException("Theme inconnu : " + rawCode);
		};
	}

	public List<ThemeArtifact> coherentArtifacts() {
		return List.of(hero, transport, relic);
	}

	public List<ThemeArtifact> manualArtifacts() {
		return List.of(hero, driftArtifact, relic);
	}
}
