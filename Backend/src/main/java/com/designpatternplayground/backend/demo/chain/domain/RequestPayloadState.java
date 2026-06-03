package com.designpatternplayground.backend.demo.chain.domain;

import java.util.Locale;

import com.designpatternplayground.backend.common.exception.InvalidPatternConfigurationException;

public enum RequestPayloadState {

	VALID("VALID", "Payload valide"),
	INVALID("INVALID", "Payload invalide");

	private final String code;
	private final String label;

	RequestPayloadState(String code, String label) {
		this.code = code;
		this.label = label;
	}

	public String code() {
		return code;
	}

	public String label() {
		return label;
	}

	public static RequestPayloadState fromCode(String rawCode) {
		if (rawCode == null || rawCode.isBlank()) {
			throw new InvalidPatternConfigurationException("payloadState est obligatoire.");
		}

		String normalized = rawCode.trim().toUpperCase(Locale.ROOT);

		for (RequestPayloadState state : values()) {
			if (state.code.equals(normalized)) {
				return state;
			}
		}

		throw new InvalidPatternConfigurationException("État de payload inconnu : " + rawCode);
	}
}
