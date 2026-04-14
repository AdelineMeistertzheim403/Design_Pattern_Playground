package com.designpatternplayground.backend.demo.abstractfactory;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.springframework.stereotype.Component;

import com.designpatternplayground.backend.common.exception.InvalidPatternConfigurationException;
import com.designpatternplayground.backend.demo.abstractfactory.domain.AbstractFactoryStep;
import com.designpatternplayground.backend.demo.abstractfactory.domain.AbstractThemeProfile;
import com.designpatternplayground.backend.demo.abstractfactory.domain.ThemeArtifact;
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
public class AbstractFactoryPatternDemo implements DesignPatternDemo {

	private static final String WITH_ABSTRACT_FACTORY = "WITH_ABSTRACT_FACTORY";
	private static final String WITHOUT_ABSTRACT_FACTORY = "WITHOUT_ABSTRACT_FACTORY";

	@Override
	public String getCode() {
		return "abstract-factory";
	}

	@Override
	public PatternMetadata getMetadata() {
		return new PatternMetadata(
			getCode(),
			"Abstract Factory",
			PatternType.CREATIONAL,
			"Fabrique des familles d objets coherentes sans exposer les classes concretes ni melanger les themes au niveau du client.",
			"Choisir un theme sci-fi ou medieval puis generer un hero, un transport et une relique parfaitement alignes.",
			"INTERMEDIATE"
		);
	}

	@Override
	public PatternSchema getSchema() {
		return new PatternSchema(List.of(
			new PatternField("mode", "Mode", FieldType.SELECT, true, List.of(WITH_ABSTRACT_FACTORY, WITHOUT_ABSTRACT_FACTORY), WITH_ABSTRACT_FACTORY),
			new PatternField("themeCode", "Theme", FieldType.SELECT, true, List.of("SCI_FI", "MEDIEVAL"), "SCI_FI"),
			new PatternField("generatorLabel", "Nom du generateur", FieldType.TEXT, true, null, "Theme Generator")
		));
	}

	@Override
	public PatternExecutionResult execute(PatternExecutionRequest request) {
		AbstractFactoryConfig config = toConfig(request.parameters());
		boolean useFactory = WITH_ABSTRACT_FACTORY.equals(config.mode());
		AbstractThemeProfile theme = AbstractThemeProfile.fromCode(config.themeCode());
		List<ThemeArtifact> artifacts = useFactory ? theme.coherentArtifacts() : theme.manualArtifacts();
		boolean coherentFamily = useFactory;
		int familySize = artifacts.size();
		int manualTouchCount = useFactory ? 1 : familySize;
		String resultLabel = coherentFamily ? "Theme coherent" : "Family drift";

		List<AbstractFactoryStep> steps = buildSteps(config.generatorLabel(), theme, artifacts, useFactory, coherentFamily);
		List<String> logs = buildLogs(config.generatorLabel(), theme, artifacts, useFactory, coherentFamily);

		LinkedHashMap<String, Object> output = new LinkedHashMap<>();
		output.put("mode", config.mode());
		output.put("modeLabel", useFactory ? "Avec Abstract Factory" : "Sans Abstract Factory");
		output.put("generatorLabel", config.generatorLabel());
		output.put("themeCode", theme.code());
		output.put("themeLabel", theme.label());
		output.put("factoryClassName", theme.factoryClassName());
		output.put("familyLabel", theme.familyLabel());
		output.put("moodLabel", theme.moodLabel());
		output.put("coherentFamily", coherentFamily);
		output.put("resultLabel", resultLabel);
		output.put("manualTouchCount", manualTouchCount);
		output.put("familySize", familySize);
		output.put("driftThemeLabel", coherentFamily ? "" : theme.driftThemeLabel());
		output.put("hero", toArtifactMap(artifacts.get(0)));
		output.put("transport", toArtifactMap(artifacts.get(1)));
		output.put("relic", toArtifactMap(artifacts.get(2)));
		output.put("stepCount", steps.size());
		output.put("steps", steps.stream().map(this::toStepMap).toList());

		return new PatternExecutionResult(
			getCode(),
			useFactory
				? "Abstract Factory cree toute une famille d objets coherente depuis un theme unique. Le client demande une ambiance, pas des classes concretes dispersees."
				: "Sans Abstract Factory, le client assemble chaque produit a la main. Il suffit d un mauvais choix pour casser la coherence de la famille complete.",
			logs,
			output,
			buildVisualization(config.generatorLabel(), theme, artifacts, useFactory, coherentFamily)
		);
	}

	private AbstractFactoryConfig toConfig(Map<String, Object> parameters) {
		if (parameters == null || parameters.get("mode") == null || parameters.get("themeCode") == null) {
			throw new InvalidPatternConfigurationException("mode et themeCode sont obligatoires.");
		}

		String mode = parameters.get("mode").toString().trim().toUpperCase(Locale.ROOT);
		if (!WITH_ABSTRACT_FACTORY.equals(mode) && !WITHOUT_ABSTRACT_FACTORY.equals(mode)) {
			throw new InvalidPatternConfigurationException("mode doit valoir WITH_ABSTRACT_FACTORY ou WITHOUT_ABSTRACT_FACTORY.");
		}

		String generatorLabel = parameters.getOrDefault("generatorLabel", "Theme Generator").toString().trim();
		if (generatorLabel.isBlank()) {
			generatorLabel = "Theme Generator";
		}

		return new AbstractFactoryConfig(
			mode,
			parameters.get("themeCode").toString(),
			generatorLabel
		);
	}

	private List<AbstractFactoryStep> buildSteps(
		String generatorLabel,
		AbstractThemeProfile theme,
		List<ThemeArtifact> artifacts,
		boolean useFactory,
		boolean coherentFamily
	) {
		List<AbstractFactoryStep> steps = new ArrayList<>();
		steps.add(new AbstractFactoryStep(
			1,
			"SELECT_THEME",
			"Selection du theme",
			generatorLabel,
			"Le client choisit " + theme.label() + " comme famille cible.",
			coherentFamily,
			useFactory
		));
		steps.add(new AbstractFactoryStep(
			2,
			useFactory ? "FACTORY" : "MANUAL",
			useFactory ? "Choix de la factory" : "Assemblage manuel",
			useFactory ? theme.factoryClassName() : "ThemePickerClient",
			useFactory
				? theme.factoryClassName() + " garantit que hero, transport et relique viennent de la meme famille."
				: "Le client choisit les produits un par un. Rien ne bloque un melange entre " + theme.label() + " et " + theme.driftThemeLabel() + ".",
			coherentFamily,
			useFactory
		));
		steps.add(new AbstractFactoryStep(
			3,
			"GENERATE_FAMILY",
			"Generation des objets",
			useFactory ? theme.factoryClassName() : "ThemePickerClient",
			artifacts.get(0).label() + ", " + artifacts.get(1).label() + " et " + artifacts.get(2).label() + " sont instancies.",
			coherentFamily,
			useFactory
		));
		steps.add(new AbstractFactoryStep(
			4,
			"VERIFY",
			"Verification de coherence",
			"Theme Analyzer",
			coherentFamily
				? "Les trois objets partagent la meme direction artistique. Le theme reste lisible de bout en bout."
				: artifacts.get(1).label() + " vient du theme " + theme.driftThemeLabel() + " et casse la coherence de la famille.",
			coherentFamily,
			useFactory
		));
		return steps;
	}

	private List<String> buildLogs(
		String generatorLabel,
		AbstractThemeProfile theme,
		List<ThemeArtifact> artifacts,
		boolean useFactory,
		boolean coherentFamily
	) {
		List<String> logs = new ArrayList<>();
		logs.add(generatorLabel + " recoit la demande pour le theme " + theme.label() + ".");
		logs.add(useFactory
			? theme.factoryClassName() + " prend en charge toute la famille d objets."
			: "Le client selectionne manuellement chaque produit concret.");
		logs.add("Hero -> " + artifacts.get(0).label() + ".");
		logs.add("Transport -> " + artifacts.get(1).label() + ".");
		logs.add("Relic -> " + artifacts.get(2).label() + ".");
		logs.add(coherentFamily
			? "La famille reste coherent et extensible."
			: "La famille derive : un produit appartient a un autre univers visuel.");
		return logs;
	}

	private VisualizationGraph buildVisualization(
		String generatorLabel,
		AbstractThemeProfile theme,
		List<ThemeArtifact> artifacts,
		boolean useFactory,
		boolean coherentFamily
	) {
		List<VisualizationNode> nodes = new ArrayList<>();
		nodes.add(new VisualizationNode("client", generatorLabel, "client", Map.of("detail", theme.label())));
		nodes.add(new VisualizationNode(
			"factory",
			useFactory ? theme.factoryClassName() : "Manual assembly",
			useFactory ? "factory" : "cluster",
			Map.of("detail", useFactory ? "family creation" : "concrete picks")
		));
		nodes.add(new VisualizationNode("hero", artifacts.get(0).label(), "product", Map.of("detail", artifacts.get(0).className(), "active", true)));
		nodes.add(new VisualizationNode("transport", artifacts.get(1).label(), "product", Map.of("detail", artifacts.get(1).className(), "active", coherentFamily)));
		nodes.add(new VisualizationNode("relic", artifacts.get(2).label(), "product", Map.of("detail", artifacts.get(2).className(), "active", true)));
		nodes.add(new VisualizationNode(
			"result",
			coherentFamily ? "Coherent family" : "Family drift",
			"output",
			Map.of("message", coherentFamily ? theme.familyLabel() : "theme mismatch")
		));

		List<VisualizationEdge> edges = new ArrayList<>();
		edges.add(new VisualizationEdge("client", "factory", useFactory ? "request family" : "pick each"));
		edges.add(new VisualizationEdge("factory", "hero", "create hero"));
		edges.add(new VisualizationEdge("factory", "transport", useFactory ? "create transport" : "manual pick"));
		edges.add(new VisualizationEdge("factory", "relic", "create relic"));
		edges.add(new VisualizationEdge("factory", "result", coherentFamily ? "coherent" : "mismatch"));

		return new VisualizationGraph(nodes, edges);
	}

	private Map<String, Object> toArtifactMap(ThemeArtifact artifact) {
		return Map.of(
			"slotCode", artifact.slotCode(),
			"slotLabel", artifact.slotLabel(),
			"className", artifact.className(),
			"label", artifact.label(),
			"detail", artifact.detail()
		);
	}

	private Map<String, Object> toStepMap(AbstractFactoryStep step) {
		return Map.of(
			"index", step.index(),
			"stageCode", step.stageCode(),
			"title", step.title(),
			"actorLabel", step.actorLabel(),
			"detail", step.detail(),
			"coherentFamily", step.coherentFamily(),
			"usesFactory", step.usesFactory()
		);
	}
}
