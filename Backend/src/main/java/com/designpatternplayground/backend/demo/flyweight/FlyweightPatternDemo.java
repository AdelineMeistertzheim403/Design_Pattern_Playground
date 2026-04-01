package com.designpatternplayground.backend.demo.flyweight;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.IntStream;

import org.springframework.stereotype.Component;

import com.designpatternplayground.backend.common.exception.InvalidPatternConfigurationException;
import com.designpatternplayground.backend.demo.flyweight.domain.FlyweightAssetProfile;
import com.designpatternplayground.backend.demo.flyweight.domain.SceneObjectFlyweightFactory;
import com.designpatternplayground.backend.demo.flyweight.domain.SharedSceneAsset;
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
public class FlyweightPatternDemo implements DesignPatternDemo {

	private static final int MIN_OBJECT_COUNT = 100;
	private static final int MAX_OBJECT_COUNT = 10000;
	private static final int MIN_VARIANT_COUNT = 1;
	private static final int MAX_VARIANT_COUNT = 12;

	@Override
	public String getCode() {
		return "flyweight";
	}

	@Override
	public PatternMetadata getMetadata() {
		return new PatternMetadata(
			"flyweight",
			"Flyweight",
			PatternType.STRUCTURAL,
			"Partage l etat intrinseque entre de nombreux objets afin de reduire le nombre d instances reelles en memoire.",
			"Afficher des milliers d arbres, particules ou projectiles sans dupliquer les memes donnees lourdes pour chaque objet.",
			"ADVANCED"
		);
	}

	@Override
	public PatternSchema getSchema() {
		return new PatternSchema(List.of(
			new PatternField(
				"assetType",
				"Type d objet",
				FieldType.SELECT,
				true,
				List.of("TREE", "PARTICLE", "BULLET"),
				"TREE"
			),
			new PatternField(
				"objectCount",
				"Nombre d objets",
				FieldType.NUMBER,
				true,
				null,
				"2400"
			),
			new PatternField(
				"sharedVariantCount",
				"Variantes partagees",
				FieldType.NUMBER,
				true,
				null,
				"6"
			),
			new PatternField(
				"useFlyweight",
				"Mode Flyweight",
				FieldType.BOOLEAN,
				true,
				null,
				"true"
			)
		));
	}

	@Override
	public PatternExecutionResult execute(PatternExecutionRequest request) {
		FlyweightConfig config = toConfig(request.parameters());
		FlyweightAssetProfile profile = FlyweightAssetProfile.fromCode(config.assetType());
		int variantCount = Math.min(config.sharedVariantCount(), config.objectCount());
		List<String> logs = new ArrayList<>();

		logs.add("Chargement du profil " + profile.label() + ".");
		logs.add("Simulation de " + config.objectCount() + " objet(s) avec " + variantCount + " variante(s) visuelles.");

		SceneObjectFlyweightFactory factory = new SceneObjectFlyweightFactory();
		List<Map<String, Object>> variants = new ArrayList<>();

		IntStream.range(0, variantCount).forEach(index -> {
			int distributedObjects = distributeObjects(config.objectCount(), variantCount, index);
			SharedSceneAsset asset = factory.getFlyweight(profile, index + 1);

			variants.add(Map.of(
				"code", asset.variantCode(),
				"label", asset.label(),
				"objects", distributedObjects,
				"shared", config.useFlyweight()
			));
		});

		long baselineMemoryKb = (long) config.objectCount() * (profile.intrinsicStateKb() + profile.extrinsicStateKb());
		long currentMemoryKb;
		int realInstances;

		if (config.useFlyweight()) {
			realInstances = factory.size();
			currentMemoryKb = (long) factory.size() * profile.intrinsicStateKb()
				+ (long) config.objectCount() * profile.extrinsicStateKb();
			logs.add("Activation du cache Flyweight : " + factory.size() + " instance(s) partagee(s) seulement.");
			logs.add("Chaque objet garde uniquement son etat extrinseque : position, echelle et variation.");
		} else {
			realInstances = config.objectCount();
			currentMemoryKb = baselineMemoryKb;
			logs.add("Mode sans Flyweight : chaque objet embarque son etat complet.");
			logs.add("Le moteur recree donc " + realInstances + " instance(s) concretes en memoire.");
		}

		long savedMemoryKb = Math.max(0L, baselineMemoryKb - currentMemoryKb);
		double savingsPercent = baselineMemoryKb == 0
			? 0.0
			: roundToSingleDecimal((savedMemoryKb * 100.0) / baselineMemoryKb);
		double simulatedFrameCostMs = roundToSingleDecimal(computeFrameCost(config.objectCount(), realInstances, config.useFlyweight()));
		String performanceLabel = describePerformance(simulatedFrameCostMs, config.useFlyweight());

		logs.add("Memoire theorique sans partage : " + baselineMemoryKb + " KB.");
		logs.add("Memoire theorique dans le mode courant : " + currentMemoryKb + " KB.");
		logs.add(config.useFlyweight()
			? "Gain estime : " + savedMemoryKb + " KB economises (" + savingsPercent + "%)."
			: "Aucun gain : le pattern n est pas active.");

		LinkedHashMap<String, Object> output = new LinkedHashMap<>();
		output.put("mode", config.useFlyweight() ? "WITH_FLYWEIGHT" : "WITHOUT_FLYWEIGHT");
		output.put("modeLabel", config.useFlyweight() ? "Avec Flyweight" : "Sans Flyweight");
		output.put("assetType", profile.code());
		output.put("assetLabel", profile.label());
		output.put("objectCount", config.objectCount());
		output.put("sharedVariantCount", variantCount);
		output.put("realInstances", realInstances);
		output.put("intrinsicStateKb", profile.intrinsicStateKb());
		output.put("extrinsicStateKb", profile.extrinsicStateKb());
		output.put("memoryCurrentKb", currentMemoryKb);
		output.put("memoryWithoutFlyweightKb", baselineMemoryKb);
		output.put("savedMemoryKb", savedMemoryKb);
		output.put("savingsPercent", savingsPercent);
		output.put("simulatedFrameCostMs", simulatedFrameCostMs);
		output.put("performanceLabel", performanceLabel);
		output.put("variants", variants);

		return new PatternExecutionResult(
			getCode(),
			config.useFlyweight()
				? "Flyweight mutualise les donnees lourdes pour alimenter une foule d objets legerement differencies."
				: "Sans Flyweight, chaque objet garde son etat complet et la pression memoire grimpe lineairement.",
			logs,
			output,
			buildVisualization(profile, config, variantCount, realInstances, currentMemoryKb, baselineMemoryKb, performanceLabel)
		);
	}

	private VisualizationGraph buildVisualization(
		FlyweightAssetProfile profile,
		FlyweightConfig config,
		int variantCount,
		int realInstances,
		long currentMemoryKb,
		long baselineMemoryKb,
		String performanceLabel
	) {
		List<VisualizationNode> nodes = new ArrayList<>();
		List<VisualizationEdge> edges = new ArrayList<>();

		nodes.add(new VisualizationNode(
			"scene",
			config.objectCount() + " " + profile.label().toLowerCase(Locale.ROOT),
			"cluster",
			Map.of("detail", config.useFlyweight() ? "etat extrinseque par objet" : "etat complet duplique")
		));
		nodes.add(new VisualizationNode(
			"factory",
			"SceneObjectFlyweightFactory",
			"pool",
			Map.of("detail", config.useFlyweight() ? "cache actif" : "cache contourne")
		));
		nodes.add(new VisualizationNode(
			"metrics",
			"Memoire",
			"output",
			Map.of(
				"message",
				currentMemoryKb + " KB / " + baselineMemoryKb + " KB - " + performanceLabel
			)
		));

		edges.add(new VisualizationEdge("scene", "factory", "spawn"));
		edges.add(new VisualizationEdge("factory", "metrics", "measure"));

		IntStream.range(0, Math.min(variantCount, 4)).forEach(index -> {
			String nodeId = "flyweight-" + (index + 1);
			nodes.add(new VisualizationNode(
				nodeId,
				profile.label() + " " + (index + 1),
				"flyweight",
				Map.of(
					"detail",
					config.useFlyweight()
						? "instance partagee"
						: distributeObjects(config.objectCount(), variantCount, index) + " copie(s) independante(s)"
				)
			));
			edges.add(new VisualizationEdge("factory", nodeId, config.useFlyweight() ? "share" : "copy"));
		});

		nodes.add(new VisualizationNode(
			"instances",
			realInstances + " instance(s)",
			"memory",
			Map.of("message", config.useFlyweight() ? "partage actif" : "duplication totale")
		));
		edges.add(new VisualizationEdge("scene", "instances", "allocate"));

		return new VisualizationGraph(nodes, edges);
	}

	private FlyweightConfig toConfig(Map<String, Object> parameters) {
		if (parameters == null) {
			throw new InvalidPatternConfigurationException("Les parametres sont obligatoires.");
		}

		String assetType = requireText(parameters.get("assetType"), "assetType");
		int objectCount = parseInteger(parameters.get("objectCount"), "objectCount", MIN_OBJECT_COUNT, MAX_OBJECT_COUNT);
		int sharedVariantCount = parseInteger(
			parameters.get("sharedVariantCount"),
			"sharedVariantCount",
			MIN_VARIANT_COUNT,
			MAX_VARIANT_COUNT
		);
		boolean useFlyweight = parseBoolean(parameters.get("useFlyweight"), true);

		return new FlyweightConfig(assetType, objectCount, sharedVariantCount, useFlyweight);
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

	private int parseInteger(Object value, String fieldName, int min, int max) {
		if (value == null) {
			throw new InvalidPatternConfigurationException(fieldName + " est obligatoire.");
		}

		int parsed;
		try {
			parsed = (int) Math.round(Double.parseDouble(value.toString()));
		} catch (NumberFormatException exception) {
			throw new InvalidPatternConfigurationException(fieldName + " doit etre numerique.");
		}

		if (parsed < min || parsed > max) {
			throw new InvalidPatternConfigurationException(
				fieldName + " doit etre compris entre " + min + " et " + max + "."
			);
		}

		return parsed;
	}

	private boolean parseBoolean(Object value, boolean defaultValue) {
		if (value == null) {
			return defaultValue;
		}

		if (value instanceof Boolean booleanValue) {
			return booleanValue;
		}

		return Boolean.parseBoolean(value.toString());
	}

	private int distributeObjects(int objectCount, int variantCount, int variantIndex) {
		int base = objectCount / variantCount;
		int remainder = objectCount % variantCount;
		return base + (variantIndex < remainder ? 1 : 0);
	}

	private double computeFrameCost(int objectCount, int realInstances, boolean useFlyweight) {
		double objectCost = useFlyweight ? objectCount * 0.0019 : objectCount * 0.0046;
		double instanceCost = useFlyweight ? realInstances * 0.11 : realInstances * 0.002;
		double baseline = useFlyweight ? 8.5 : 11.0;
		return baseline + objectCost + instanceCost;
	}

	private String describePerformance(double frameCostMs, boolean useFlyweight) {
		if (frameCostMs >= 38.0) {
			return useFlyweight ? "Charge tres haute mais encore contenue" : "Lag probable";
		}

		if (frameCostMs >= 24.0) {
			return useFlyweight ? "Charge visible mais stable" : "Charge sensible";
		}

		return useFlyweight ? "Stable malgre la foule" : "Acceptable a petite echelle";
	}

	private double roundToSingleDecimal(double value) {
		return Math.round(value * 10.0) / 10.0;
	}
}
