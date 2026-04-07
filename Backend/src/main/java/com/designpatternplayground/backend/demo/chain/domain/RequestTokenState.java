package com.designpatternplayground.backend.demo.chain.domain;

import java.util.Locale;

import com.designpatternplayground.backend.common.exception.InvalidPatternConfigurationException;

public enum RequestTokenState {

	VALID("VALID", "Token valide"),
	EXPIRED("EXPIRED", "Token expire"),
	MISSING("MISSING", "Token manquant");

	private final String code;
	private final String label;

	RequestTokenState(String code, String label) {
		this.code = code;
		this.label = label;
	}

	public String code() {
		return code;
	}

	public String label() {
		return label;
	}

	public static RequestTokenState fromCode(String rawCode) {
		if (rawCode == null || rawCode.isBlank()) {
			throw new InvalidPatternConfigurationException("tokenState est obligatoire.");
		}

		String normalized = rawCode.trim().toUpperCase(Locale.ROOT);

		for (RequestTokenState state : values()) {
			if (state.code.equals(normalized)) {
				return state;
			}
		}

		throw new InvalidPatternConfigurationException("Etat de token inconnu : " + rawCode);
	}
}
