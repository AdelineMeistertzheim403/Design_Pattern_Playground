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
		"Néon, métal et interfaces holographiques.",
		"Médiéval",
		new ThemeArtifact(
			"HERO",
			"Héros",
			"SpacePilot",
			"Nova Pilot",
			"Pilote tactique conçu pour des environnements orbitaux et des missions à haute vitesse."
		),
		new ThemeArtifact(
			"TRANSPORT",
			"Transport",
			"HoverBike",
			"Pulse Hoverbike",
			"Véhicule léger à sustentation magnétique parfait pour garder une silhouette futuriste cohérente."
		),
		new ThemeArtifact(
			"RELIC",
			"Relique",
			"PlasmaRelic",
			"Quantum Core",
			"Artefact lumineux qui alimente l'univers visuel et le gameplay du thème."
		),
		new ThemeArtifact(
			"TRANSPORT",
			"Transport",
			"WarHorse",
			"Iron Warhorse",
			"Monture lourde issue d'un autre univers. Elle casse immédiatement la cohérence de famille."
		)
	);

	public static final AbstractThemeProfile MEDIEVAL = new AbstractThemeProfile(
		"MEDIEVAL",
		"Médiéval",
		"MedievalThemeFactory",
		"Castle defense pack",
		"Pierre, cuir, bannières et artisanat héroïque.",
		"Sci-Fi",
		new ThemeArtifact(
			"HERO",
			"Héros",
			"KnightChampion",
			"Knight Champion",
			"Champion de mêlée bâti pour les remparts, les parades et le duel frontal."
		),
		new ThemeArtifact(
			"TRANSPORT",
			"Transport",
			"WarHorse",
			"Iron Warhorse",
			"Monture blindée qui garde la famille médiévale lisible et homogène."
		),
		new ThemeArtifact(
			"RELIC",
			"Relique",
			"RunicBanner",
			"Runic Banner",
			"Relique de commandement qui porte les couleurs et la magie du royaume."
		),
		new ThemeArtifact(
			"TRANSPORT",
			"Transport",
			"HoverBike",
			"Pulse Hoverbike",
			"Véhicule à sustentation venu d'un autre thème. Il crée une rupture immédiate dans la famille d'objets."
		)
	);

	public static AbstractThemeProfile fromCode(String rawCode) {
		if (rawCode == null || rawCode.isBlank()) {
			return SCI_FI;
		}

		return switch (rawCode.trim().toUpperCase(Locale.ROOT)) {
			case "SCI_FI" -> SCI_FI;
			case "MEDIEVAL" -> MEDIEVAL;
			default -> throw new InvalidPatternConfigurationException("Thème inconnu : " + rawCode);
		};
	}

	public List<ThemeArtifact> coherentArtifacts() {
		return List.of(hero, transport, relic);
	}

	public List<ThemeArtifact> manualArtifacts() {
		return List.of(hero, driftArtifact, relic);
	}
}
