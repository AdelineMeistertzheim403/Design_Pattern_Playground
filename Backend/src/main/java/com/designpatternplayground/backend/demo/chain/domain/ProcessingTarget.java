package com.designpatternplayground.backend.demo.chain.domain;

import java.util.Locale;

import com.designpatternplayground.backend.common.exception.InvalidPatternConfigurationException;

public enum ProcessingTarget {

	REPORT_EXPORT("REPORT_EXPORT", "Export de rapport", "Le service de reporting génère le fichier demande."),
	BULK_IMPORT("BULK_IMPORT", "Import en masse", "Le service d import planifie le traitement des données."),
	PASSWORD_RESET("PASSWORD_RESET", "Reinitialisation de mot de passe", "Le service IAM emet un jeton de reinitialisation.");

	private final String code;
	private final String label;
	private final String handledMessage;

	ProcessingTarget(String code, String label, String handledMessage) {
		this.code = code;
		this.label = label;
		this.handledMessage = handledMessage;
	}

	public String code() {
		return code;
	}

	public String label() {
		return label;
	}

	public String handledMessage() {
		return handledMessage;
	}

	public static ProcessingTarget fromCode(String rawCode) {
		if (rawCode == null || rawCode.isBlank()) {
			throw new InvalidPatternConfigurationException("processingTarget est obligatoire.");
		}

		String normalized = rawCode.trim().toUpperCase(Locale.ROOT);

		for (ProcessingTarget target : values()) {
			if (target.code.equals(normalized)) {
				return target;
			}
		}

		throw new InvalidPatternConfigurationException("Cible de traitement inconnue : " + rawCode);
	}
}
