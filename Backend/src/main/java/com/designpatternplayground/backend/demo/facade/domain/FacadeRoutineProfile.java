package com.designpatternplayground.backend.demo.facade.domain;

import java.util.Arrays;
import java.util.Locale;

import com.designpatternplayground.backend.common.exception.InvalidPatternConfigurationException;

public enum FacadeRoutineProfile {

	CINEMA_MODE(
		"CINEMA_MODE",
		"Cinema Mode",
		"Lance une seance en une seule action en coordonnant audio surround, lumière tamisee et sécurité perimetrique.",
		"immersive focus",
		"Passe en surround 7.1 et baisse les notifications.",
		"Tamise la pièce a 18% avec une teinte ambre.",
		"Verrouille le perimetre en mode silencieux.",
		"SECURITY",
		"La lumière et le son sont prêts, mais la sécurité reste oubliee si le client pilote les modules à la main."
	),
	NIGHT_SHUTDOWN(
		"NIGHT_SHUTDOWN",
		"Night Shutdown",
		"Coupe la maison pour la nuit avec extinction des medias, lumière de circulation minimale et armêment complet.",
		"quiet safe",
		"Place l audio en veille complete.",
		"Eteint les zones principales et garde un chemin lumineux doux.",
		"Arme la maison en mode nuit.",
		"AUDIO",
		"La fermeture manuelle oublie souvent l audio, qui continue a tourner alors que le reste est coupe."
	),
	PARTY_STARTUP(
		"PARTY_STARTUP",
		"Party Startup",
		"Déclenche une ambiance festive avec preset audio, lumière dynamique et sécurité adaptée aux invites.",
		"open social",
		"Charge une playlist energique avec bass boost.",
		"Active des scènes couleur pulsees dans les espaces communs.",
		"Basculle la sécurité sur accès invites supervise.",
		"SECURITY",
		"Sans facade, l accès invites reste souvent non configure et casse l experience des arrivants."
	);

	private final String code;
	private final String label;
	private final String description;
	private final String ambianceLabel;
	private final String audioAction;
	private final String lightAction;
	private final String securityAction;
	private final String manualMissedSubsystem;
	private final String manualMissedDetail;

	FacadeRoutineProfile(
		String code,
		String label,
		String description,
		String ambianceLabel,
		String audioAction,
		String lightAction,
		String securityAction,
		String manualMissedSubsystem,
		String manualMissedDetail
	) {
		this.code = code;
		this.label = label;
		this.description = description;
		this.ambianceLabel = ambianceLabel;
		this.audioAction = audioAction;
		this.lightAction = lightAction;
		this.securityAction = securityAction;
		this.manualMissedSubsystem = manualMissedSubsystem;
		this.manualMissedDetail = manualMissedDetail;
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

	public String ambianceLabel() {
		return ambianceLabel;
	}

	public String audioAction() {
		return audioAction;
	}

	public String lightAction() {
		return lightAction;
	}

	public String securityAction() {
		return securityAction;
	}

	public String manualMissedSubsystem() {
		return manualMissedSubsystem;
	}

	public String manualMissedDetail() {
		return manualMissedDetail;
	}

	public static FacadeRoutineProfile fromCode(String code) {
		return Arrays.stream(values())
			.filter(value -> value.code.equals(code == null ? "" : code.trim().toUpperCase(Locale.ROOT)))
			.findFirst()
			.orElseThrow(() -> new InvalidPatternConfigurationException("Routine Facade inconnue : " + code));
	}
}
