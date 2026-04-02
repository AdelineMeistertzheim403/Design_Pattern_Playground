package com.designpatternplayground.backend.demo.decorator;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.springframework.stereotype.Component;

import com.designpatternplayground.backend.common.exception.InvalidPatternConfigurationException;
import com.designpatternplayground.backend.demo.decorator.domain.BaseCharacter;
import com.designpatternplayground.backend.demo.decorator.domain.CharacterComponent;
import com.designpatternplayground.backend.demo.decorator.domain.CharacterDecorator;
import com.designpatternplayground.backend.demo.decorator.domain.CharacterStats;
import com.designpatternplayground.backend.demo.decorator.domain.FireDecorator;
import com.designpatternplayground.backend.demo.decorator.domain.HeroArchetype;
import com.designpatternplayground.backend.demo.decorator.domain.IceDecorator;
import com.designpatternplayground.backend.demo.decorator.domain.ShieldDecorator;
import com.designpatternplayground.backend.demo.decorator.domain.SpeedDecorator;
import com.designpatternplayground.backend.pattern.api.DesignPatternDemo;
import com.designpatternplayground.backend.pattern.domain.FieldType;
import com.designpatternplayground.backend.pattern.domain.PatternExecutionRequest;
import com.designpatternplayground.backend.pattern.domain.PatternExecutionResult;
import com.designpatternplayground.backend.pattern.domain.PatternField;
import com.designpatternplayground.backend.pattern.domain.PatternMetadata;
import com.designpatternplayground.backend.pattern.domain.PatternSchema;
import com.designpatternplayground.backend.pattern.domain.PatternType;
import com.designpatternplayground.backend.pattern.domain.VisualizationEdge;
import com.designpatternplayground.backend.pattern.domain.VisualizationGraph;
import com.designpatternplayground.backend.pattern.domain.VisualizationNode;

@Component
public class DecoratorPatternDemo implements DesignPatternDemo {

	private static final List<String> AVAILABLE_DECORATORS = List.of("FIRE", "SHIELD", "SPEED", "ICE");
	private static final String CHALLENGE_GOAL = "attaque >= 20 et defense >= 10";

	@Override
	public String getCode() {
		return "decorator";
	}

	@Override
	public PatternMetadata getMetadata() {
		return new PatternMetadata(
			"decorator",
			"Decorator",
			PatternType.STRUCTURAL,
			"Ajoute des responsabilites a un objet dynamiquement en l enveloppant dans des decorators successifs.",
			"Construire un personnage avec des power-ups empilables sans multiplier les classes du type PersonnageFeuBouclierVitesse.",
			"INTERMEDIATE"
		);
	}

	@Override
	public PatternSchema getSchema() {
		return new PatternSchema(List.of(
			new PatternField(
				"characterName",
				"Nom du personnage",
				FieldType.TEXT,
				true,
				null,
				"Ember Knight"
			),
			new PatternField(
				"baseType",
				"Archetype de base",
				FieldType.SELECT,
				true,
				List.of("WARRIOR", "MAGE", "ROGUE"),
				"WARRIOR"
			),
			new PatternField(
				"decorators",
				"Decorators",
				FieldType.LIST,
				true,
				AVAILABLE_DECORATORS,
				"FIRE, SHIELD"
			)
		));
	}

	@Override
	public PatternExecutionResult execute(PatternExecutionRequest request) {
		DecoratorConfig config = toConfig(request.parameters());
		HeroArchetype archetype = HeroArchetype.fromCode(config.baseType());
		CharacterComponent component = new BaseCharacter(config.characterName(), archetype);
		List<String> logs = new ArrayList<>();
		List<Map<String, Object>> stack = new ArrayList<>();

		logs.add("Creation du composant de base " + config.characterName() + " sur le profil " + archetype.label() + ".");
		logs.add("Stats de depart : " + describeStats(component.stats()) + ".");
		stack.add(toLayerMap(
			"BASE",
			"BaseCharacter",
			archetype.label(),
			archetype.flavorText(),
			component.stats()
		));

		for (String decoratorCode : config.decorators()) {
			CharacterDecorator decorator = applyDecorator(component, decoratorCode);
			component = decorator;
			logs.add("Ajout de " + decorator.layerLabel() + " autour du composant courant.");
			logs.add("Effet applique : " + decorator.effectLabel());
			stack.add(toLayerMap(
				decorator.code(),
				decorator.getClass().getSimpleName(),
				decorator.layerLabel(),
				decorator.effectLabel(),
				decorator.stats()
			));
		}

		CharacterStats finalStats = component.stats();
		boolean challengeMet = finalStats.attack() >= 20 && finalStats.defense() >= 10;

		logs.add("Stats finales : " + describeStats(finalStats) + ".");
		logs.add(challengeMet
			? "Objectif atteint : le build depasse le seuil cible."
			: "Objectif non atteint : il reste de la marge pour optimiser la pile de decorators.");

		LinkedHashMap<String, Object> output = new LinkedHashMap<>();
		output.put("characterName", config.characterName());
		output.put("baseType", archetype.code());
		output.put("baseLabel", archetype.label());
		output.put("decoratorCount", config.decorators().size());
		output.put("decorators", config.decorators());
		output.put("attack", finalStats.attack());
		output.put("defense", finalStats.defense());
		output.put("speed", finalStats.speed());
		output.put("control", finalStats.control());
		output.put("activeEffects", component.activeEffects());
		output.put("challengeGoal", CHALLENGE_GOAL);
		output.put("challengeMet", challengeMet);
		output.put("classExplosionExamples", classExplosionExamples(archetype));
		output.put("stack", stack);

		return new PatternExecutionResult(
			getCode(),
			config.decorators().isEmpty()
				? "Sans Decorator, le personnage reste un composant de base. Chaque nouvel effet demanderait sinon une nouvelle classe specialisee."
				: "Decorator empile des effets autour du meme composant pour faire evoluer le build sans toucher a la classe d origine.",
			logs,
			output,
			buildVisualization(archetype, stack, finalStats, challengeMet)
		);
	}

	private VisualizationGraph buildVisualization(
		HeroArchetype archetype,
		List<Map<String, Object>> stack,
		CharacterStats finalStats,
		boolean challengeMet
	) {
		List<VisualizationNode> nodes = new ArrayList<>();
		List<VisualizationEdge> edges = new ArrayList<>();

		nodes.add(new VisualizationNode(
			"base",
			archetype.label(),
			"component",
			Map.of("detail", "composant de base")
		));

		String wrappedId = "base";
		String outermostId = "base";

		for (int index = 1; index < stack.size(); index += 1) {
			Map<String, Object> layer = stack.get(index);
			String nodeId = "decorator-" + index;

			nodes.add(new VisualizationNode(
				nodeId,
				layer.get("layerLabel").toString(),
				"decorator",
				Map.of("detail", layer.get("effect").toString())
			));
			edges.add(new VisualizationEdge(nodeId, wrappedId, "wraps"));
			wrappedId = nodeId;
			outermostId = nodeId;
		}

		nodes.add(new VisualizationNode(
			"result",
			challengeMet ? "Build valide" : "Build final",
			"output",
			Map.of("message", describeStats(finalStats))
		));
		edges.add(new VisualizationEdge(outermostId, "result", "render"));

		return new VisualizationGraph(nodes, edges);
	}

	private CharacterDecorator applyDecorator(CharacterComponent component, String decoratorCode) {
		return switch (decoratorCode) {
			case "FIRE" -> new FireDecorator(component);
			case "SHIELD" -> new ShieldDecorator(component);
			case "SPEED" -> new SpeedDecorator(component);
			case "ICE" -> new IceDecorator(component);
			default -> throw new InvalidPatternConfigurationException("Decorator inconnu : " + decoratorCode);
		};
	}

	private Map<String, Object> toLayerMap(
		String code,
		String layerClass,
		String layerLabel,
		String effect,
		CharacterStats stats
	) {
		LinkedHashMap<String, Object> map = new LinkedHashMap<>();
		map.put("code", code);
		map.put("layerClass", layerClass);
		map.put("layerLabel", layerLabel);
		map.put("effect", effect);
		map.put("attack", stats.attack());
		map.put("defense", stats.defense());
		map.put("speed", stats.speed());
		map.put("control", stats.control());
		return map;
	}

	private List<String> classExplosionExamples(HeroArchetype archetype) {
		String prefix = archetype.label().replace(" ", "");
		return List.of(
			prefix + "FireShield",
			prefix + "FireSpeed",
			prefix + "ShieldIce"
		);
	}

	private String describeStats(CharacterStats stats) {
		return "ATK " + stats.attack()
			+ " / DEF " + stats.defense()
			+ " / SPD " + stats.speed()
			+ " / CTRL " + stats.control();
	}

	private DecoratorConfig toConfig(Map<String, Object> parameters) {
		if (parameters == null) {
			throw new InvalidPatternConfigurationException("Les parametres sont obligatoires.");
		}

		String characterName = requireText(parameters.get("characterName"), "characterName");
		String baseType = requireText(parameters.get("baseType"), "baseType").toUpperCase(Locale.ROOT);
		List<String> decorators = extractDecorators(parameters.get("decorators"));

		return new DecoratorConfig(characterName, baseType, decorators);
	}

	private String requireText(Object value, String fieldName) {
		if (value == null) {
			throw new InvalidPatternConfigurationException(fieldName + " est obligatoire.");
		}

		String normalized = value.toString().trim();
		if (normalized.isEmpty()) {
			throw new InvalidPatternConfigurationException(fieldName + " ne peut pas etre vide.");
		}

		return normalized;
	}

	private List<String> extractDecorators(Object rawValue) {
		if (rawValue == null) {
			return List.of();
		}

		List<?> source = rawValue instanceof List<?> list
			? list
			: List.of(rawValue.toString().split(","));

		LinkedHashSet<String> decorators = new LinkedHashSet<>();

		for (Object item : source) {
			String normalized = item == null
				? ""
				: item.toString().trim().toUpperCase(Locale.ROOT);

			if (normalized.isEmpty()) {
				continue;
			}

			if (!AVAILABLE_DECORATORS.contains(normalized)) {
				throw new InvalidPatternConfigurationException("Decorator inconnu : " + normalized);
			}

			decorators.add(normalized);
		}

		return List.copyOf(decorators);
	}
}
