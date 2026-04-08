package com.designpatternplayground.backend.demo.proxy.domain;

import java.util.Locale;

import com.designpatternplayground.backend.common.exception.InvalidPatternConfigurationException;

public enum ProxyCacheState {
	COLD("COLD", "Cache froid"),
	WARM("WARM", "Cache chaud");

	private final String code;
	private final String label;

	ProxyCacheState(String code, String label) {
		this.code = code;
		this.label = label;
	}

	public String code() {
		return code;
	}

	public String label() {
		return label;
	}

	public static ProxyCacheState fromCode(String code) {
		for (ProxyCacheState state : values()) {
			if (state.code.equals(code.toUpperCase(Locale.ROOT))) {
				return state;
			}
		}

		throw new InvalidPatternConfigurationException("Etat de cache Proxy inconnu : " + code);
	}
}
