package com.designpatternplayground.backend.demo.proxy.domain;

import java.util.Locale;

import com.designpatternplayground.backend.common.exception.InvalidPatternConfigurationException;

public enum ProxyRequesterRole {
	ADMIN("ADMIN", "Admin"),
	MEMBER("MEMBER", "Member"),
	GUEST("GUEST", "Guest");

	private final String code;
	private final String label;

	ProxyRequesterRole(String code, String label) {
		this.code = code;
		this.label = label;
	}

	public String code() {
		return code;
	}

	public String label() {
		return label;
	}

	public static ProxyRequesterRole fromCode(String code) {
		for (ProxyRequesterRole role : values()) {
			if (role.code.equals(code.toUpperCase(Locale.ROOT))) {
				return role;
			}
		}

		throw new InvalidPatternConfigurationException("Role Proxy inconnu : " + code);
	}
}
