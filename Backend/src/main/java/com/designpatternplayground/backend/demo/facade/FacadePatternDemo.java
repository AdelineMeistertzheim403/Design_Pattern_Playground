package com.designpatternplayground.backend.demo.facade;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.springframework.stereotype.Component;

import com.designpatternplayground.backend.common.exception.InvalidPatternConfigurationException;
import com.designpatternplayground.backend.demo.facade.domain.FacadeRoutineProfile;
import com.designpatternplayground.backend.demo.facade.domain.FacadeStep;
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
public class FacadePatternDemo implements DesignPatternDemo {

	private static final String WITH_FACADE = "WITH_FACADE";
	private static final String WITHOUT_FACADE = "WITHOUT_FACADE";
	private static final List<String> SUBSYSTEMS = List.of("AUDIO", "LIGHT", "SECURITY");

	@Override
	public String getCode() {
		return "facade";
	}

	@Override
	public PatternMetadata getMetadata() {
		return new PatternMetadata(
			"facade",
			"Facade",
			PatternType.STRUCTURAL,
			"Expose une entrée simple vers un système composé de plusieurs sous-systèmes et masque la chorégraphie détaillée.",
			"Déclencher une routine domotique audio + lumière + sécurité en un clic au lieu de piloter chaque module à la main.",
			"BEGINNER"
		);
	}

	@Override
	public PatternSchema getSchema() {
		return new PatternSchema(List.of(
			new PatternField("mode", "Mode", FieldType.SELECT, true, List.of(WITH_FACADE, WITHOUT_FACADE), WITH_FACADE),
			new PatternField(
				"routineCode",
				"Routine",
				FieldType.SELECT,
				true,
				List.of("CINEMA_MODE", "NIGHT_SHUTDOWN", "PARTY_STARTUP"),
				"CINEMA_MODE"
			),
			new PatternField("triggerLabel", "Libelle du bouton", FieldType.TEXT, true, null, "Start")
		));
	}

	@Override
	public PatternExecutionResult execute(PatternExecutionRequest request) {
		FacadeConfig config = toConfig(request.parameters());
		FacadeRoutineProfile routine = FacadeRoutineProfile.fromCode(config.routineCode());
		boolean useFacade = WITH_FACADE.equals(config.mode());
		boolean audioReady = useFacade || !"AUDIO".equals(routine.manualMissedSubsystem());
		boolean lightReady = useFacade || !"LIGHT".equals(routine.manualMissedSubsystem());
		boolean securityReady = useFacade || !"SECURITY".equals(routine.manualMissedSubsystem());
		boolean systemsReady = audioReady && lightReady && securityReady;
		List<String> missedSubsystems = collectMissedSubsystems(audioReady, lightReady, securityReady);
		int manualTouchCount = useFacade ? 1 : 3;
		int latencyMs = useFacade ? 210 : (systemsReady ? 360 : 470);
		List<FacadeStep> steps = buildSteps(config.triggerLabel(), routine, useFacade, audioReady, lightReady, securityReady, systemsReady);
		List<String> logs = buildLogs(config.triggerLabel(), routine, useFacade, audioReady, lightReady, securityReady);

		LinkedHashMap<String, Object> output = new LinkedHashMap<>();
		output.put("mode", config.mode());
		output.put("modeLabel", useFacade ? "Avec Facade" : "Sans Facade");
		output.put("triggerLabel", config.triggerLabel());
		output.put("routineCode", routine.code());
		output.put("routineLabel", routine.label());
		output.put("routineDescription", routine.description());
		output.put("ambianceLabel", routine.ambianceLabel());
		output.put("audioAction", routine.audioAction());
		output.put("lightAction", routine.lightAction());
		output.put("securityAction", routine.securityAction());
		output.put("audioReady", audioReady);
		output.put("lightReady", lightReady);
		output.put("securityReady", securityReady);
		output.put("systemsReady", systemsReady);
		output.put("missedSubsystems", missedSubsystems);
		output.put("subsystemCount", SUBSYSTEMS.size());
		output.put("manualTouchCount", manualTouchCount);
		output.put("orchestrationLabel", useFacade ? "One-click orchestration" : "Manual fan-out");
		output.put("resultLabel", systemsReady ? "Routine active" : "Routine partielle");
		output.put("latencyMs", latencyMs);
		output.put("stepCount", steps.size());
		output.put("steps", steps.stream().map(this::toStepMap).toList());

		return new PatternExecutionResult(
			getCode(),
			useFacade
				? "Facade condense la routine dans une seule methode. Le client appuie sur Start et laisse la facade chorégraphier audio, lumière et sécurité."
				: "Sans Facade, le client diffuse lui-même les appels vers chaque sous-système. Le flux reste plus verbeux et un module peut facilement etre oublie.",
			logs,
			output,
			buildVisualization(useFacade, audioReady, lightReady, securityReady, systemsReady)
		);
	}

	private List<FacadeStep> buildSteps(
		String triggerLabel,
		FacadeRoutineProfile routine,
		boolean useFacade,
		boolean audioReady,
		boolean lightReady,
		boolean securityReady,
		boolean systemsReady
	) {
		List<FacadeStep> steps = new ArrayList<>();
		int nextIndex = 1;
		steps.add(new FacadeStep(
			nextIndex++,
			"TRIGGER",
			"CLIENT",
			"Appui utilisateur",
			"HomeAutomationClient",
			"SENT",
			"Le client presse " + triggerLabel + " pour lancer " + routine.label() + "."
		));

		if (useFacade) {
			steps.add(new FacadeStep(
				nextIndex++,
				"FACADE",
				"FACADE",
				"Orchestration",
				"SmartHomeFacade",
				"ORCHESTRATING",
				"La facade decomposé la routine en trois appels lisibles vers audio, lumière et sécurité."
			));
		}

		steps.add(subsystemStep(useFacade, nextIndex++, "AUDIO", "AudioSystem", "Preset audio", routine.audioAction(), audioReady, routine.manualMissedDetail()));
		steps.add(subsystemStep(useFacade, nextIndex++, "LIGHT", "LightSystem", "Scène lumière", routine.lightAction(), lightReady, routine.manualMissedDetail()));
		steps.add(subsystemStep(useFacade, nextIndex++, "SECURITY", "SecuritySystem", "Mode sécurité", routine.securityAction(), securityReady, routine.manualMissedDetail()));
		steps.add(new FacadeStep(
			nextIndex,
			"RESULT",
			"RESULT",
			"État global",
			useFacade ? "SmartHomeFacade" : "HomeAutomationClient",
			systemsReady ? "READY" : "PARTIAL",
			systemsReady
				? "La routine demarre completement depuis un point d entrée unique."
				: "Le système reste partiel car une coordination manuelle a laisse un sous-système à l'ecart."
		));
		return steps;
	}

	private FacadeStep subsystemStep(
		boolean useFacade,
		int index,
		String systemCode,
		String actorLabel,
		String title,
		String action,
		boolean ready,
		String manualMissedDetail
	) {
		return new FacadeStep(
			index,
			systemCode,
			systemCode,
			title,
			actorLabel,
			ready ? "READY" : "MISSED",
			ready
				? (useFacade ? "Déclenche par la facade. " : "Déclenche directement par le client. ") + action
				: manualMissedDetail
		);
	}

	private List<String> buildLogs(
		String triggerLabel,
		FacadeRoutineProfile routine,
		boolean useFacade,
		boolean audioReady,
		boolean lightReady,
		boolean securityReady
	) {
		List<String> logs = new ArrayList<>();
		logs.add("Le client appuie sur " + triggerLabel + " pour lancer " + routine.label() + ".");

		if (useFacade) {
			logs.add("SmartHomeFacade expose une seule methode et orchestre les trois sous-systèmes.");
		} else {
			logs.add("Sans facade, le client manipule chaque sous-système directement.");
		}

		logs.add("AudioSystem -> " + (audioReady ? routine.audioAction() : routine.manualMissedDetail()));
		logs.add("LightSystem -> " + (lightReady ? routine.lightAction() : routine.manualMissedDetail()));
		logs.add("SecuritySystem -> " + (securityReady ? routine.securityAction() : routine.manualMissedDetail()));
		return logs;
	}

	private List<String> collectMissedSubsystems(boolean audioReady, boolean lightReady, boolean securityReady) {
		List<String> missed = new ArrayList<>();
		if (!audioReady) {
			missed.add("Audio");
		}
		if (!lightReady) {
			missed.add("Lumière");
		}
		if (!securityReady) {
			missed.add("Sécurité");
		}
		return missed;
	}

	private VisualizationGraph buildVisualization(
		boolean useFacade,
		boolean audioReady,
		boolean lightReady,
		boolean securityReady,
		boolean systemsReady
	) {
		List<VisualizationNode> nodes = new ArrayList<>();
		nodes.add(new VisualizationNode("client", "Control Button", "client", Map.of("detail", "one-click trigger")));

		if (useFacade) {
			nodes.add(new VisualizationNode("facade", "SmartHomeFacade", "context", Map.of("detail", "single entry point")));
		}

		nodes.add(new VisualizationNode("audio", "AudioSystem", "component", Map.of("detail", audioReady ? "ready" : "missed", "active", audioReady)));
		nodes.add(new VisualizationNode("light", "LightSystem", "component", Map.of("detail", lightReady ? "ready" : "missed", "active", lightReady)));
		nodes.add(new VisualizationNode("security", "SecuritySystem", "component", Map.of("detail", securityReady ? "ready" : "missed", "active", securityReady)));
		nodes.add(new VisualizationNode("result", systemsReady ? "Routine active" : "Routine partielle", "output", Map.of("message", systemsReady ? "all systems aligned" : "manual drift")));

		List<VisualizationEdge> edges = new ArrayList<>();
		if (useFacade) {
			edges.add(new VisualizationEdge("client", "facade", "start"));
			edges.add(new VisualizationEdge("facade", "audio", "audio"));
			edges.add(new VisualizationEdge("facade", "light", "light"));
			edges.add(new VisualizationEdge("facade", "security", "security"));
			edges.add(new VisualizationEdge("facade", "result", systemsReady ? "ready" : "partial"));
		} else {
			edges.add(new VisualizationEdge("client", "audio", audioReady ? "audio" : "missed"));
			edges.add(new VisualizationEdge("client", "light", lightReady ? "light" : "missed"));
			edges.add(new VisualizationEdge("client", "security", securityReady ? "security" : "missed"));
			edges.add(new VisualizationEdge("client", "result", systemsReady ? "ready" : "partial"));
		}

		return new VisualizationGraph(nodes, edges);
	}

	private Map<String, Object> toStepMap(FacadeStep step) {
		return Map.of(
			"index", step.index(),
			"stageCode", step.stageCode(),
			"systemCode", step.systemCode(),
			"title", step.title(),
			"actorLabel", step.actorLabel(),
			"status", step.status(),
			"detail", step.detail()
		);
	}

	private FacadeConfig toConfig(Map<String, Object> parameters) {
		if (parameters == null) {
			throw new InvalidPatternConfigurationException("Les paramètres Facade sont obligatoires.");
		}

		String mode = requireText(parameters, "mode").toUpperCase(Locale.ROOT);
		if (!WITH_FACADE.equals(mode) && !WITHOUT_FACADE.equals(mode)) {
			throw new InvalidPatternConfigurationException("mode doit valoir WITH_FACADE ou WITHOUT_FACADE.");
		}

		return new FacadeConfig(
			mode,
			requireText(parameters, "routineCode").toUpperCase(Locale.ROOT),
			requireText(parameters, "triggerLabel")
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
