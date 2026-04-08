package com.designpatternplayground.backend.demo.prototype.domain;

import java.util.Locale;
import java.util.Map;

import com.designpatternplayground.backend.common.exception.InvalidPatternConfigurationException;

public record PrototypeArchetype(
	String code,
	String label,
	String description,
	String shellColorHex,
	String shellLabel,
	int baseAttack,
	int baseDefense,
	int baseSpeed,
	String baseModuleCode,
	String baseModuleLabel,
	String baseModuleColorHex,
	String baseModuleEffect,
	String baseModuleSyncKey,
	int baseModuleAttack,
	int baseModuleDefense,
	int baseModuleSpeed
) {

	private static final Map<String, PrototypeArchetype> ARCHETYPES = Map.of(
		"SCOUT_DRONE",
		new PrototypeArchetype(
			"SCOUT_DRONE",
			"Scout Drone",
			"Un eclaireur leger clone rapidement pour couvrir le terrain avec un noyau de navigation partageable.",
			"#d7b28d",
			"coque sable",
			8,
			5,
			10,
			"SCOUT_CORE",
			"Scout Core",
			"#45b6c9",
			"traces radar",
			"scout-link",
			2,
			1,
			3
		),
		"SIEGE_MECH",
		new PrototypeArchetype(
			"SIEGE_MECH",
			"Siege Mech",
			"Une plate-forme lourde dupliquee en plusieurs chassis pour preparer une vague de combat specialisee.",
			"#8f6b54",
			"armure bronze",
			11,
			10,
			4,
			"SIEGE_CORE",
			"Siege Core",
			"#426c8d",
			"pulse gravite",
			"siege-link",
			3,
			4,
			0
		),
		"ARCANE_SENTINEL",
		new PrototypeArchetype(
			"ARCANE_SENTINEL",
			"Arcane Sentinel",
			"Un gardien mystique clone a la demande pour garder la meme silhouette tout en variant les charges internes.",
			"#b996d0",
			"plaque violette",
			9,
			8,
			6,
			"ARCANE_CORE",
			"Arcane Core",
			"#7b57a2",
			"echo runique",
			"arcane-link",
			4,
			2,
			2
		)
	);

	public static PrototypeArchetype fromCode(String code) {
		PrototypeArchetype archetype = ARCHETYPES.get(code.toUpperCase(Locale.ROOT));
		if (archetype == null) {
			throw new InvalidPatternConfigurationException("Archetype Prototype inconnu : " + code);
		}

		return archetype;
	}

	public PrototypeUnit seed(String blueprintName) {
		return new PrototypeUnit(
			"prototype-seed",
			blueprintName,
			"SEED-001",
			shellColorHex,
			shellLabel,
			baseAttack,
			baseDefense,
			baseSpeed,
			new PrototypeCompanionState(
				baseModuleCode,
				baseModuleLabel,
				baseModuleColorHex,
				baseModuleEffect,
				baseModuleSyncKey,
				baseModuleAttack,
				baseModuleDefense,
				baseModuleSpeed
			)
		);
	}
}
