package com.designpatternplayground.backend.demo.adapter;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.springframework.stereotype.Component;

import com.designpatternplayground.backend.common.exception.InvalidPatternConfigurationException;
import com.designpatternplayground.backend.demo.adapter.domain.AdaptationStep;
import com.designpatternplayground.backend.demo.adapter.domain.AdapterScenario;
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
public class AdapterPatternDemo implements DesignPatternDemo {

	private static final String WITH_ADAPTER = "WITH_ADAPTER";
	private static final String WITHOUT_ADAPTER = "WITHOUT_ADAPTER";

	@Override
	public String getCode() {
		return "adapter";
	}

	@Override
	public PatternMetadata getMetadata() {
		return new PatternMetadata(
			"adapter",
			"Adapter",
			PatternType.STRUCTURAL,
			"Traduit une interface incompatible vers le contrat attendu par le client sans modifier le composant legacy.",
			"Connecter un système historique à une cible moderne en convertissant le protocole, le connecteur ou le format de message.",
			"INTERMEDIATE"
		);
	}

	@Override
	public PatternSchema getSchema() {
		return new PatternSchema(List.of(
			new PatternField("mode", "Mode", FieldType.SELECT, true, List.of(WITH_ADAPTER, WITHOUT_ADAPTER), WITH_ADAPTER),
			new PatternField(
				"scenario",
				"Scénario",
				FieldType.SELECT,
				true,
				List.of("VGA_TO_HDMI", "SERIAL_TO_REST", "XML_TO_JSON"),
				"VGA_TO_HDMI"
			),
			new PatternField("payloadLabel", "Signal a transporter", FieldType.TEXT, true, null, "Telemetry burst 42")
		));
	}

	@Override
	public PatternExecutionResult execute(PatternExecutionRequest request) {
		AdapterConfig config = toConfig(request.parameters());
		AdapterScenario scenario = AdapterScenario.fromCode(config.scenario());
		boolean useAdapter = WITH_ADAPTER.equals(config.mode());
		String sourceSignal = scenario.sourceSignal(config.payloadLabel());
		String adaptedSignal = scenario.adaptedSignal(config.payloadLabel());
		List<AdaptationStep> steps = new ArrayList<>();
		List<String> logs = new ArrayList<>();

		steps.add(new AdaptationStep(
			1,
			"SOURCE_EMIT",
			"Émission source",
			scenario.sourceSystem(),
			scenario.sourceProtocol(),
			sourceSignal,
			scenario.sourceSystem() + " emet le signal via " + scenario.sourceInterface() + ".",
			true
		));
		logs.add("La source " + scenario.sourceSystem() + " emet " + sourceSignal + " sur " + scenario.sourceInterface() + ".");

		if (useAdapter) {
			steps.add(new AdaptationStep(
				2,
				"ADAPT",
				"Conversion",
				scenario.adapterClassName(),
				"Target -> Adaptée bridge",
				adaptedSignal,
				scenario.adapterRole(),
				true
			));
			steps.add(new AdaptationStep(
				3,
				"TARGET_CONSUME",
				"Reception cible",
				scenario.targetSystem(),
				scenario.targetProtocol(),
				adaptedSignal,
				scenario.successDetail(),
				true
			));

			logs.add("L adapter " + scenario.adapterClassName() + " convertit le signal vers " + scenario.targetProtocol() + ".");
			logs.add(scenario.targetSystem() + " consomme ensuite " + adaptedSignal + " sur " + scenario.targetInterface() + ".");
		} else {
			steps.add(new AdaptationStep(
				2,
				"TARGET_REJECT",
				"Echec de compatibilite",
				scenario.targetSystem(),
				scenario.targetProtocol(),
				sourceSignal,
				scenario.failureReason(),
				false
			));
			logs.add("Sans adapter, la cible " + scenario.targetSystem() + " refuse le signal brut.");
		}

		boolean compatible = useAdapter;
		String compatibilityLabel = compatible ? "Compatibilite obtenue" : "Connexion refusee";
		String summary = compatible
			? "Adapter traduit l'interface legacy vers le contrat attendu par la cible sans toucher ni au client ni à l'adaptée."
			: "Sans Adapter, la source et la cible restent incompatibles. Le client tente de brancher deux contrats qui ne se comprennent pas.";

		LinkedHashMap<String, Object> output = new LinkedHashMap<>();
		output.put("mode", config.mode());
		output.put("modeLabel", compatible ? "Avec Adapter" : "Sans Adapter");
		output.put("scenario", scenario.code());
		output.put("scenarioLabel", scenario.label());
		output.put("payloadLabel", config.payloadLabel());
		output.put("sourceSystem", scenario.sourceSystem());
		output.put("sourceInterface", scenario.sourceInterface());
		output.put("sourceProtocol", scenario.sourceProtocol());
		output.put("sourceSignal", sourceSignal);
		output.put("adapterClassName", scenario.adapterClassName());
		output.put("adapterRole", scenario.adapterRole());
		output.put("targetSystem", scenario.targetSystem());
		output.put("targetInterface", scenario.targetInterface());
		output.put("targetProtocol", scenario.targetProtocol());
		output.put("adaptedSignal", adaptedSignal);
		output.put("compatible", compatible);
		output.put("compatibilityLabel", compatibilityLabel);
		output.put("failureReason", scenario.failureReason());
		output.put("stepCount", steps.size());
		output.put("steps", steps.stream().map(this::toStepMap).toList());

		return new PatternExecutionResult(
			getCode(),
			summary,
			logs,
			output,
			buildVisualization(scenario, sourceSignal, adaptedSignal, compatible)
		);
	}

	private VisualizationGraph buildVisualization(
		AdapterScenario scenario,
		String sourceSignal,
		String adaptedSignal,
		boolean compatible
	) {
		List<VisualizationNode> nodes = List.of(
			new VisualizationNode("source", scenario.sourceSystem(), "client", Map.of("detail", scenario.sourceProtocol())),
			new VisualizationNode("source-port", scenario.sourceInterface(), "component", Map.of("detail", sourceSignal)),
			new VisualizationNode(
				"adapter",
				compatible ? scenario.adapterClassName() : "NoAdapter",
				"decorator",
				Map.of("detail", compatible ? "conversion bridge" : "missing translation")
			),
			new VisualizationNode("target-port", scenario.targetInterface(), "strategy", Map.of("detail", scenario.targetProtocol())),
			new VisualizationNode("target", scenario.targetSystem(), "observer", Map.of("detail", compatible ? adaptedSignal : "incompatible input")),
			new VisualizationNode(
				"result",
				compatible ? "Compatible" : "Rejected",
				"output",
				Map.of("message", compatible ? scenario.successDetail() : scenario.failureReason())
			)
		);

		List<VisualizationEdge> edges = compatible
			? List.of(
				new VisualizationEdge("source", "source-port", "emit"),
				new VisualizationEdge("source-port", "adapter", "adapt"),
				new VisualizationEdge("adapter", "target-port", "convert"),
				new VisualizationEdge("target-port", "target", "deliver"),
				new VisualizationEdge("target", "result", "ready")
			)
			: List.of(
				new VisualizationEdge("source", "source-port", "emit"),
				new VisualizationEdge("source-port", "target-port", "mismatch"),
				new VisualizationEdge("target-port", "target", "reject"),
				new VisualizationEdge("target", "result", "stop")
			);

		return new VisualizationGraph(nodes, edges);
	}

	private Map<String, Object> toStepMap(AdaptationStep step) {
		return Map.of(
			"index", step.index(),
			"stageCode", step.stageCode(),
			"title", step.title(),
			"systemLabel", step.systemLabel(),
			"protocolLabel", step.protocolLabel(),
			"signalLabel", step.signalLabel(),
			"detail", step.detail(),
			"success", step.success()
		);
	}

	private AdapterConfig toConfig(Map<String, Object> parameters) {
		if (parameters == null) {
			throw new InvalidPatternConfigurationException("Les paramètres Adapter sont obligatoires.");
		}

		String mode = requireText(parameters, "mode").toUpperCase(Locale.ROOT);
		if (!WITH_ADAPTER.equals(mode) && !WITHOUT_ADAPTER.equals(mode)) {
			throw new InvalidPatternConfigurationException("mode doit valoir WITH_ADAPTER ou WITHOUT_ADAPTER.");
		}

		return new AdapterConfig(
			mode,
			requireText(parameters, "scenario").toUpperCase(Locale.ROOT),
			requireText(parameters, "payloadLabel")
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
