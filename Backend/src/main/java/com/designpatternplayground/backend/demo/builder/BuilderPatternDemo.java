package com.designpatternplayground.backend.demo.builder;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.springframework.stereotype.Component;

import com.designpatternplayground.backend.common.exception.InvalidPatternConfigurationException;
import com.designpatternplayground.backend.demo.builder.domain.AddonOption;
import com.designpatternplayground.backend.demo.builder.domain.ArtifactDirector;
import com.designpatternplayground.backend.demo.builder.domain.BuildStage;
import com.designpatternplayground.backend.demo.builder.domain.BuildStats;
import com.designpatternplayground.backend.demo.builder.domain.BuilderProductType;
import com.designpatternplayground.backend.demo.builder.domain.BuiltArtifact;
import com.designpatternplayground.backend.demo.builder.domain.CoreModuleOption;
import com.designpatternplayground.backend.demo.builder.domain.FinishStyleOption;
import com.designpatternplayground.backend.demo.builder.domain.SilhouetteOption;
import com.designpatternplayground.backend.demo.builder.domain.WorkshopArtifactBuilder;
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
public class BuilderPatternDemo implements DesignPatternDemo {

	private static final String WITH_BUILDER = "WITH_BUILDER";
	private static final String WITHOUT_BUILDER = "WITHOUT_BUILDER";
	private static final String CHALLENGE_GOAL = "utility >= 9 et style >= 7";

	private final ArtifactDirector director = new ArtifactDirector();

	@Override
	public String getCode() {
		return "builder";
	}

	@Override
	public PatternMetadata getMetadata() {
		return new PatternMetadata(
			"builder",
			"Builder",
			PatternType.CREATIONAL,
			"Construit un objet complexe étape par étape au lieu de passer une grappe de paramètres à un constructeur géant.",
			"Assembler visuellement une voiture, un personnage ou une maison en posant la structure, le noyau, un module puis la finition.",
			"INTERMEDIATE"
		);
	}

	@Override
	public PatternSchema getSchema() {
		return new PatternSchema(List.of(
			new PatternField(
				"mode",
				"Mode",
				FieldType.SELECT,
				true,
				List.of(WITH_BUILDER, WITHOUT_BUILDER),
				WITH_BUILDER
			),
			new PatternField(
				"buildName",
				"Nom du build",
				FieldType.TEXT,
				true,
				null,
				"Aurora Mk II"
			),
			new PatternField(
				"productType",
				"Type d objet",
				FieldType.SELECT,
				true,
				codes(BuilderProductType.values()),
				"CAR"
			),
			new PatternField(
				"silhouette",
				"Étape 1 · Structure",
				FieldType.SELECT,
				true,
				codes(SilhouetteOption.values()),
				"BALANCED"
			),
			new PatternField(
				"coreModule",
				"Étape 2 · Noyau",
				FieldType.SELECT,
				true,
				codes(CoreModuleOption.values()),
				"ELECTRIC"
			),
			new PatternField(
				"addonModule",
				"Étape 3 · Module",
				FieldType.SELECT,
				true,
				codes(AddonOption.values()),
				"SUPPORT"
			),
			new PatternField(
				"finishStyle",
				"Étape 4 · Finition",
				FieldType.SELECT,
				true,
				codes(FinishStyleOption.values()),
				"CLASSIC"
			)
		));
	}

	@Override
	public PatternExecutionResult execute(PatternExecutionRequest request) {
		BuilderConfig config = toConfig(request.parameters());
		BuilderProductType productType = BuilderProductType.fromCode(config.productType());
		SilhouetteOption silhouette = SilhouetteOption.fromCode(config.silhouette());
		CoreModuleOption coreModule = CoreModuleOption.fromCode(config.coreModule());
		AddonOption addonModule = AddonOption.fromCode(config.addonModule());
		FinishStyleOption finishStyle = FinishStyleOption.fromCode(config.finishStyle());
		boolean useBuilder = WITH_BUILDER.equals(config.mode());
		List<String> logs = new ArrayList<>();

		BuiltArtifact artifact;
		if (useBuilder) {
			artifact = buildWithBuilder(config.buildName(), productType, silhouette, coreModule, addonModule, finishStyle, logs);
		} else {
			artifact = buildWithoutBuilder(config.buildName(), productType, silhouette, coreModule, addonModule, finishStyle, logs);
		}

		boolean challengeMet = artifact.stats().utility() >= 9 && artifact.stats().style() >= 7;
		String readyLabel = challengeMet ? "Blueprint valide" : "Blueprint a optimiser";

		logs.add("Produit final : " + artifact.buildName() + " / " + artifact.productType().label() + " -> " + artifact.stats().summary() + ".");
		logs.add(challengeMet
			? "Le build atteint le seuil attendu. La construction est exploitable telle quelle."
			: "Le build reste coherent, mais sa combinaison peut encore etre renforcee.");

		LinkedHashMap<String, Object> output = new LinkedHashMap<>();
		output.put("mode", useBuilder ? WITH_BUILDER : WITHOUT_BUILDER);
		output.put("modeLabel", useBuilder ? "Avec Builder" : "Sans Builder");
		output.put("buildName", artifact.buildName());
		output.put("productType", artifact.productType().code());
		output.put("productLabel", artifact.productType().label());
		output.put("productDescription", artifact.productType().description());
		output.put("silhouetteCode", artifact.silhouetteCode());
		output.put("silhouetteLabel", artifact.silhouetteLabel());
		output.put("coreModuleCode", artifact.coreModuleCode());
		output.put("coreModuleLabel", artifact.coreModuleLabel());
		output.put("addonModuleCode", artifact.addonModuleCode());
		output.put("addonModuleLabel", artifact.addonModuleLabel());
		output.put("finishStyleCode", artifact.finishStyleCode());
		output.put("finishStyleLabel", artifact.finishStyleLabel());
		output.put("agility", artifact.stats().agility());
		output.put("resilience", artifact.stats().resilience());
		output.put("utility", artifact.stats().utility());
		output.put("style", artifact.stats().style());
		output.put("totalScore", artifact.stats().totalScore());
		output.put("stageCount", artifact.stages().size());
		output.put("challengeGoal", CHALLENGE_GOAL);
		output.put("challengeMet", challengeMet);
		output.put("readyLabel", readyLabel);
		output.put("monolithicPainPoints", List.of(
			"Constructeur géant peu lisible",
			"Ordre implicite des paramètres",
			"Validation plus difficile a faire evoluer"
		));
		output.put("stages", artifact.stages().stream().map(this::toStageMap).toList());

		return new PatternExecutionResult(
			getCode(),
			useBuilder
				? "Builder rend la construction progressive et lisible. Le director orchestre les appels, le builder assemble le produit sans exposer un constructeur géant."
				: "Sans Builder, le client pousse tous les paramètres d'un bloc. Le produit final apparait, mais le processus de construction est cache et plus rigide.",
			logs,
			output,
			buildVisualization(artifact, readyLabel, useBuilder)
		);
	}

	private BuiltArtifact buildWithBuilder(
		String buildName,
		BuilderProductType productType,
		SilhouetteOption silhouette,
		CoreModuleOption coreModule,
		AddonOption addonModule,
		FinishStyleOption finishStyle,
		List<String> logs
	) {
		WorkshopArtifactBuilder builder = new WorkshopArtifactBuilder();

		logs.add("Le client demande un " + productType.label().toLowerCase(Locale.ROOT) + " nomme " + buildName + ".");
		logs.add("Le director orchestre la construction et garde l ordre des étapes stable.");

		director.construct(buildName, productType, silhouette, coreModule, addonModule, finishStyle, builder);

		BuiltArtifact artifact = builder.build();
		artifact.stages().forEach(stage -> logs.add(
			"Étape " + stage.index() + " - " + stage.stageLabel() + " : " + stage.optionLabel() + ". " + stage.detail()
		));
		logs.add("Le builder retourne un produit complet sans exposer le constructeur detaille au client.");

		return artifact;
	}

	private BuiltArtifact buildWithoutBuilder(
		String buildName,
		BuilderProductType productType,
		SilhouetteOption silhouette,
		CoreModuleOption coreModule,
		AddonOption addonModule,
		FinishStyleOption finishStyle,
		List<String> logs
	) {
		logs.add("Mode sans Builder : le client instancie directement " + productType.monolithicClassName() + " avec tous les paramètres.");
		logs.add("Paramètres passes d'un bloc : "
			+ silhouette.code() + ", "
			+ coreModule.code() + ", "
			+ addonModule.code() + ", "
			+ finishStyle.code() + ".");
		logs.add("Le produit final apparait sans director ni étapes explicites dans le code appelant.");

		List<BuildStage> stages = new ArrayList<>();
		BuildStats runningStats = BuildStats.zero();

		runningStats = appendStage(stages, productType, "SILHOUETTE", silhouette.code(), silhouette.labelFor(productType), silhouette.detailFor(productType, buildName), silhouette.stats(), runningStats);
		runningStats = appendStage(stages, productType, "CORE", coreModule.code(), coreModule.labelFor(productType), coreModule.detailFor(productType, buildName), coreModule.stats(), runningStats);
		runningStats = appendStage(stages, productType, "ADDON", addonModule.code(), addonModule.labelFor(productType), addonModule.detailFor(productType, buildName), addonModule.stats(), runningStats);
		runningStats = appendStage(stages, productType, "FINISH", finishStyle.code(), finishStyle.labelFor(productType), finishStyle.detailFor(productType, buildName), finishStyle.stats(), runningStats);

		return new BuiltArtifact(
			buildName,
			productType,
			silhouette.code(),
			silhouette.labelFor(productType),
			coreModule.code(),
			coreModule.labelFor(productType),
			addonModule.code(),
			addonModule.labelFor(productType),
			finishStyle.code(),
			finishStyle.labelFor(productType),
			List.copyOf(stages),
			runningStats
		);
	}

	private BuildStats appendStage(
		List<BuildStage> stages,
		BuilderProductType productType,
		String stageCode,
		String optionCode,
		String optionLabel,
		String detail,
		BuildStats delta,
		BuildStats currentStats
	) {
		BuildStats nextStats = currentStats.add(delta);
		stages.add(new BuildStage(
			stages.size() + 1,
			stageCode,
			stageLabelFor(productType, stageCode),
			optionCode,
			optionLabel,
			detail,
			delta,
			nextStats
		));
		return nextStats;
	}

	private String stageLabelFor(BuilderProductType productType, String stageCode) {
		return switch (stageCode) {
			case "SILHOUETTE" -> productType.silhouetteStageLabel();
			case "CORE" -> productType.coreStageLabel();
			case "ADDON" -> productType.addonStageLabel();
			case "FINISH" -> productType.finishStageLabel();
			default -> throw new InvalidPatternConfigurationException("Étape Builder inconnue : " + stageCode);
		};
	}

	private Map<String, Object> toStageMap(BuildStage stage) {
		LinkedHashMap<String, Object> map = new LinkedHashMap<>();
		map.put("index", stage.index());
		map.put("stageCode", stage.stageCode());
		map.put("stageLabel", stage.stageLabel());
		map.put("optionCode", stage.optionCode());
		map.put("optionLabel", stage.optionLabel());
		map.put("detail", stage.detail());
		map.put("deltaAgility", stage.deltaStats().agility());
		map.put("deltaResilience", stage.deltaStats().resilience());
		map.put("deltaUtility", stage.deltaStats().utility());
		map.put("deltaStyle", stage.deltaStats().style());
		map.put("agility", stage.cumulativeStats().agility());
		map.put("resilience", stage.cumulativeStats().resilience());
		map.put("utility", stage.cumulativeStats().utility());
		map.put("style", stage.cumulativeStats().style());
		map.put("totalScore", stage.cumulativeStats().totalScore());
		return map;
	}

	private VisualizationGraph buildVisualization(BuiltArtifact artifact, String readyLabel, boolean useBuilder) {
		List<VisualizationNode> nodes = new ArrayList<>();
		List<VisualizationEdge> edges = new ArrayList<>();

		nodes.add(new VisualizationNode(
			"client",
			"Client",
			"client",
			Map.of("detail", artifact.buildName())
		));

		if (useBuilder) {
			nodes.add(new VisualizationNode(
				"director",
				"ArtifactDirector",
				"context",
				Map.of("detail", "orchestration stable")
			));
			nodes.add(new VisualizationNode(
				"builder",
				"WorkshopArtifactBuilder",
				"factory",
				Map.of("detail", artifact.productType().label())
			));
			edges.add(new VisualizationEdge("client", "director", "request"));
			edges.add(new VisualizationEdge("director", "builder", "orchestrates"));

			for (BuildStage stage : artifact.stages()) {
				String nodeId = "stage-" + stage.stageCode().toLowerCase(Locale.ROOT);
				nodes.add(new VisualizationNode(
					nodeId,
					stage.optionLabel(),
					"component",
					Map.of("detail", stage.stageLabel())
				));
				edges.add(new VisualizationEdge(nodeId, "builder", "step"));
			}

			nodes.add(new VisualizationNode(
				"product",
				artifact.productType().label(),
				"product",
				Map.of("detail", artifact.buildName())
			));
			nodes.add(new VisualizationNode(
				"result",
				readyLabel,
				"output",
				Map.of("message", artifact.stats().summary())
			));
			edges.add(new VisualizationEdge("builder", "product", "build"));
			edges.add(new VisualizationEdge("product", "result", "ready"));
		} else {
			nodes.add(new VisualizationNode(
				"constructor",
				artifact.productType().monolithicClassName(),
				"context",
				Map.of("detail", "constructeur géant")
			));
			edges.add(new VisualizationEdge("client", "constructor", "new(...)"));

			for (BuildStage stage : artifact.stages()) {
				String nodeId = "param-" + stage.stageCode().toLowerCase(Locale.ROOT);
				nodes.add(new VisualizationNode(
					nodeId,
					stage.optionLabel(),
					"component",
					Map.of("detail", "parametre")
				));
				edges.add(new VisualizationEdge(nodeId, "constructor", "param"));
			}

			nodes.add(new VisualizationNode(
				"product",
				artifact.productType().label(),
				"product",
				Map.of("detail", artifact.buildName())
			));
			nodes.add(new VisualizationNode(
				"result",
				readyLabel,
				"output",
				Map.of("message", artifact.stats().summary())
			));
			edges.add(new VisualizationEdge("constructor", "product", "instantiate"));
			edges.add(new VisualizationEdge("product", "result", "ready"));
		}

		return new VisualizationGraph(nodes, edges);
	}

	private BuilderConfig toConfig(Map<String, Object> parameters) {
		if (parameters == null) {
			throw new InvalidPatternConfigurationException("Les paramètres Builder sont obligatoires.");
		}

		String mode = String.valueOf(parameters.getOrDefault("mode", WITH_BUILDER)).trim().toUpperCase(Locale.ROOT);
		if (!WITH_BUILDER.equals(mode) && !WITHOUT_BUILDER.equals(mode)) {
			throw new InvalidPatternConfigurationException("Mode Builder invalide : " + mode);
		}

		String buildName = String.valueOf(parameters.getOrDefault("buildName", "Aurora Mk II")).trim();
		if (buildName.isBlank()) {
			throw new InvalidPatternConfigurationException("Le nom du build est obligatoire.");
		}

		return new BuilderConfig(
			mode,
			buildName,
			String.valueOf(parameters.getOrDefault("productType", "CAR")).trim().toUpperCase(Locale.ROOT),
			String.valueOf(parameters.getOrDefault("silhouette", "BALANCED")).trim().toUpperCase(Locale.ROOT),
			String.valueOf(parameters.getOrDefault("coreModule", "ELECTRIC")).trim().toUpperCase(Locale.ROOT),
			String.valueOf(parameters.getOrDefault("addonModule", "SUPPORT")).trim().toUpperCase(Locale.ROOT),
			String.valueOf(parameters.getOrDefault("finishStyle", "CLASSIC")).trim().toUpperCase(Locale.ROOT)
		);
	}

	private List<String> codes(Enum<?>[] values) {
		return Arrays.stream(values)
			.map(Enum::name)
			.toList();
	}
}
