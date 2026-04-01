package com.designpatternplayground.backend.demo.flyweight.domain;

import java.util.Locale;
import java.util.Map;

import com.designpatternplayground.backend.common.exception.InvalidPatternConfigurationException;

public record FlyweightAssetProfile(
	String code,
	String label,
	int intrinsicStateKb,
	int extrinsicStateKb,
	String description
) {

	private static final Map<String, FlyweightAssetProfile> PROFILES = Map.of(
		"TREE",
		new FlyweightAssetProfile(
			"TREE",
			"Arbres",
			48,
			6,
			"Chaque arbre partage le meme mesh, la meme texture et la meme palette."
		),
		"PARTICLE",
		new FlyweightAssetProfile(
			"PARTICLE",
			"Particules",
			18,
			3,
			"Chaque particule partage ses donnees de rendu mais garde sa position et sa vitesse."
		),
		"BULLET",
		new FlyweightAssetProfile(
			"BULLET",
			"Projectiles",
			12,
			2,
			"Chaque projectile partage son sprite et sa collision mais garde son etat de trajectoire."
		)
	);

	public static FlyweightAssetProfile fromCode(String code) {
		FlyweightAssetProfile profile = PROFILES.get(code.toUpperCase(Locale.ROOT));
		if (profile == null) {
			throw new InvalidPatternConfigurationException("Type d objet inconnu : " + code);
		}

		return profile;
	}
}
