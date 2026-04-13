package com.designpatternplayground.backend.demo.bridge;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.springframework.stereotype.Component;

import com.designpatternplayground.backend.common.exception.InvalidPatternConfigurationException;
import com.designpatternplayground.backend.demo.bridge.domain.BridgeRenderPreset;
import com.designpatternplayground.backend.demo.bridge.domain.BridgeRenderStep;
import com.designpatternplayground.backend.demo.bridge.domain.BridgeShapePreset;
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
public class BridgePatternDemo implements DesignPatternDemo {

	private static final String WITH_BRIDGE = "WITH_BRIDGE";
	private static final String WITHOUT_BRIDGE = "WITHOUT_BRIDGE";

	@Override
	public String getCode() {
		return "bridge";
	}

	@Override
	public PatternMetadata getMetadata() {
		return new PatternMetadata(
			getCode(),
			"Bridge",
			PatternType.STRUCTURAL,
			"Separe une abstraction de son implementation pour les faire varier independamment sans explosion de sous-classes.",
			"Piloter la meme forme avec plusieurs moteurs de rendu comme Shape + RenderEngine dans une UI ou un moteur graphique.",
			"INTERMEDIATE"
		);
	}

	@Override
	public PatternSchema getSchema() {
		return new PatternSchema(List.of(
			new PatternField("mode", "Mode", FieldType.SELECT, true, List.of(WITH_BRIDGE, WITHOUT_BRIDGE), WITH_BRIDGE),
			new PatternField("shapeCode", "Abstraction", FieldType.SELECT, true, List.of("CIRCLE", "TRIANGLE", "BANNER"), "CIRCLE"),
			new PatternField(
				"renderCode",
				"Implementation",
				FieldType.SELECT,
				true,
				List.of("VECTOR_ENGINE", "PIXEL_ENGINE", "GLOW_ENGINE"),
				"VECTOR_ENGINE"
			),
			new PatternField("objectName", "Nom de l objet", FieldType.TEXT, true, null, "Switch Engine")
		));
	}

	@Override
	public PatternExecutionResult execute(PatternExecutionRequest request) {
		BridgeConfig config = toConfig(request.parameters());
		boolean useBridge = WITH_BRIDGE.equals(config.mode());
		BridgeShapePreset shape = BridgeShapePreset.fromCode(config.shapeCode());
		BridgeRenderPreset render = BridgeRenderPreset.fromCode(config.renderCode());
		int combinationCount = 3 * 3;
		int subclassCount = useBridge ? 3 + 3 + 1 : combinationCount;

		List<BridgeRenderStep> steps = List.of(
			new BridgeRenderStep(
				1,
				"ABSTRACTION",
				"Selection de la forme",
				shape.abstractionClassName(),
				shape.label() + " porte la logique haut niveau : resize, describe, render().",
				true,
				useBridge
			),
			new BridgeRenderStep(
				2,
				"IMPLEMENTATION",
				"Selection du moteur",
				render.engineClassName(),
				render.label() + " fournit le style concret : " + render.renderStyle(),
				useBridge,
				true
			),
			new BridgeRenderStep(
				3,
				"BIND",
				"Assemblage runtime",
				useBridge ? "Shape(renderEngine)" : "ConcreteComboSubclass",
				useBridge
					? "L abstraction recoit son moteur au runtime et reste ouverte a d autres implementations."
					: "Sans Bridge, la combinaison " + shape.label() + " + " + render.label() + " force une sous-classe concrete dediee.",
				useBridge,
				useBridge
			),
			new BridgeRenderStep(
				4,
				"RENDER",
				"Rendu final",
				config.objectName(),
				useBridge
					? render.bridgeBenefit()
					: "Chaque nouveau moteur multiplie les variantes de formes et grossit la hierarchie concrete.",
				useBridge,
				useBridge
			)
		);

		LinkedHashMap<String, Object> output = new LinkedHashMap<>();
		output.put("mode", config.mode());
		output.put("modeLabel", useBridge ? "Avec Bridge" : "Sans Bridge");
		output.put("objectName", config.objectName());
		output.put("shapeCode", shape.code());
		output.put("shapeLabel", shape.label());
		output.put("shapeClassName", shape.abstractionClassName());
		output.put("shapeDetail", shape.detail());
		output.put("renderCode", render.code());
		output.put("renderLabel", render.label());
		output.put("renderClassName", render.engineClassName());
		output.put("renderStyle", render.renderStyle());
		output.put("bridgeBenefit", render.bridgeBenefit());
		output.put("abstractionStable", useBridge);
		output.put("implementationReusable", useBridge);
		output.put("subclassCount", subclassCount);
		output.put("combinationCount", combinationCount);
		output.put("stepCount", steps.size());
		output.put("resultLabel", useBridge ? "Bridge linked" : "Subclass explosion");
		output.put("steps", steps.stream().map(this::toStepMap).toList());

		return new PatternExecutionResult(
			getCode(),
			useBridge
				? "Bridge separe Shape de RenderEngine. La forme garde son API et change simplement d implementation concrete au runtime."
				: "Sans Bridge, chaque combinaison forme + moteur pousse vers une sous-classe concrete differente. La hierarchie grossit vite et le couplage devient rigide.",
			List.of(
				config.objectName() + " choisit " + shape.label() + " comme abstraction.",
				"Le rendu cible utilise " + render.label() + ".",
				useBridge
					? "Bridge injecte " + render.engineClassName() + " dans " + shape.abstractionClassName() + " sans changer l abstraction."
					: "La combinaison doit etre codee dans une classe concrete dediee pour relier forme et rendu.",
				useBridge
					? render.bridgeBenefit()
					: "Le nombre de variantes explose quand on multiplie les formes et les moteurs."
			),
			output,
			buildVisualization(useBridge, shape, render, config.objectName())
		);
	}

	private VisualizationGraph buildVisualization(
		boolean useBridge,
		BridgeShapePreset shape,
		BridgeRenderPreset render,
		String objectName
	) {
		return new VisualizationGraph(
			List.of(
				new VisualizationNode("client", objectName, "client", Map.of("detail", "asks render()")),
				new VisualizationNode("abstraction", shape.abstractionClassName(), "context", Map.of("detail", shape.label(), "active", true)),
				new VisualizationNode(
					"bridge",
					useBridge ? "RenderEngine bridge" : "ConcreteComboSubclass",
					"cluster",
					Map.of("detail", useBridge ? "runtime binding" : "hard-coded pair")
				),
				new VisualizationNode("implementation", render.engineClassName(), "component", Map.of("detail", render.label())),
				new VisualizationNode(
					"result",
					useBridge ? "Flexible rendering" : "Rigid hierarchy",
					"output",
					Map.of("message", useBridge ? render.renderStyle() : "shape + engine fused together")
				)
			),
			List.of(
				new VisualizationEdge("client", "abstraction", "render"),
				new VisualizationEdge("abstraction", "bridge", useBridge ? "delegates" : "extends combo"),
				new VisualizationEdge("bridge", "implementation", useBridge ? "calls engine" : "hard-coded render"),
				new VisualizationEdge("implementation", "result", useBridge ? "draw" : "single path")
			)
		);
	}

	private Map<String, Object> toStepMap(BridgeRenderStep step) {
		return Map.of(
			"index", step.index(),
			"stageCode", step.stageCode(),
			"title", step.title(),
			"actorLabel", step.actorLabel(),
			"detail", step.detail(),
			"abstractionStable", step.abstractionStable(),
			"implementationReusable", step.implementationReusable()
		);
	}

	private BridgeConfig toConfig(Map<String, Object> parameters) {
		if (parameters == null) {
			throw new InvalidPatternConfigurationException("Les parametres Bridge sont obligatoires.");
		}

		String mode = requireText(parameters, "mode").toUpperCase(Locale.ROOT);
		if (!WITH_BRIDGE.equals(mode) && !WITHOUT_BRIDGE.equals(mode)) {
			throw new InvalidPatternConfigurationException("mode doit valoir WITH_BRIDGE ou WITHOUT_BRIDGE.");
		}

		return new BridgeConfig(
			mode,
			requireText(parameters, "shapeCode").toUpperCase(Locale.ROOT),
			requireText(parameters, "renderCode").toUpperCase(Locale.ROOT),
			requireText(parameters, "objectName")
		);
	}

	private String requireText(Map<String, Object> parameters, String fieldName) {
		Object rawValue = parameters.get(fieldName);
		if (rawValue == null) {
			throw new InvalidPatternConfigurationException(fieldName + " est obligatoire.");
		}

		String value = rawValue.toString().trim();
		if (value.isEmpty()) {
			throw new InvalidPatternConfigurationException(fieldName + " ne peut pas etre vide.");
		}

		return value;
	}
}
