package com.designpatternplayground.backend.demo.proxy.domain;

import java.util.List;
import java.util.Locale;
import java.util.Map;

import com.designpatternplayground.backend.common.exception.InvalidPatternConfigurationException;

public record ProtectedResourceProfile(
	String code,
	String label,
	String description,
	String subjectLabel,
	String payloadLabel,
	int payloadWeightMb,
	boolean lazyCapable,
	List<ProxyRequesterRole> allowedRoles
) {

	private static final Map<String, ProtectedResourceProfile> PROFILES = Map.of(
		"VAULT_VIDEO",
		new ProtectedResourceProfile(
			"VAULT_VIDEO",
			"Vault Video",
			"Flux premium chiffre et assez lourd pour justifier une strategie de chargement differe.",
			"SecureMediaService",
			"stream aes-256",
			480,
			true,
			List.of(ProxyRequesterRole.ADMIN, ProxyRequesterRole.MEMBER)
		),
		"REPORT_ARCHIVE",
		new ProtectedResourceProfile(
			"REPORT_ARCHIVE",
			"Report Archive",
			"Archive sensible reservee aux admins, parfaite pour montrer un refus net par le proxy.",
			"ArchiveRepository",
			"bundle zip signe",
			220,
			true,
			List.of(ProxyRequesterRole.ADMIN)
		),
		"LIVE_DASHBOARD",
		new ProtectedResourceProfile(
			"LIVE_DASHBOARD",
			"Live Dashboard",
			"Tableau temps reel léger et public, utile pour voir un accès presque immédiat.",
			"RealtimeGateway",
			"delta metrics",
			64,
			false,
			List.of(ProxyRequesterRole.ADMIN, ProxyRequesterRole.MEMBER, ProxyRequesterRole.GUEST)
		)
	);

	public static ProtectedResourceProfile fromCode(String code) {
		ProtectedResourceProfile profile = PROFILES.get(code.toUpperCase(Locale.ROOT));
		if (profile == null) {
			throw new InvalidPatternConfigurationException("Ressource Proxy inconnue : " + code);
		}

		return profile;
	}

	public boolean allows(ProxyRequesterRole role) {
		return allowedRoles.contains(role);
	}
}
