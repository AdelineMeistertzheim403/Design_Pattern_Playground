package com.designpatternplayground.backend.demo.chain;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Component;

import com.designpatternplayground.backend.common.exception.InvalidPatternConfigurationException;
import com.designpatternplayground.backend.demo.chain.domain.AuthenticationHandler;
import com.designpatternplayground.backend.demo.chain.domain.PipelineRequest;
import com.designpatternplayground.backend.demo.chain.domain.PipelineStep;
import com.designpatternplayground.backend.demo.chain.domain.ProcessingHandler;
import com.designpatternplayground.backend.demo.chain.domain.ProcessingTarget;
import com.designpatternplayground.backend.demo.chain.domain.RequestHandler;
import com.designpatternplayground.backend.demo.chain.domain.RequestPayloadState;
import com.designpatternplayground.backend.demo.chain.domain.RequestTokenState;
import com.designpatternplayground.backend.demo.chain.domain.ValidationHandler;
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
public class ChainOfResponsibilityPatternDemo implements DesignPatternDemo {

	private static final String WITH_CHAIN = "WITH_CHAIN";
	private static final String WITHOUT_CHAIN = "WITHOUT_CHAIN";

	@Override
	public String getCode() {
		return "chain";
	}

	@Override
	public PatternMetadata getMetadata() {
		return new PatternMetadata(
			"chain",
			"Chain of Responsibility",
			PatternType.BEHAVIORAL,
			"Fait circuler une requete dans une chaine de maillons capables soit de la traiter, soit de la transmettre au suivant.",
			"Visualiser un pipeline de validation ou de moderation ou chaque etape peut laisser passer, stopper ou traiter la requete.",
			"INTERMEDIATE"
		);
	}

	@Override
	public PatternSchema getSchema() {
		return new PatternSchema(List.of(
			new PatternField("mode", "Mode", FieldType.SELECT, true, List.of(WITH_CHAIN, WITHOUT_CHAIN), WITH_CHAIN),
			new PatternField("requestName", "Nom de la requete", FieldType.TEXT, true, null, "Export mensuel"),
			new PatternField("tokenState", "Etat du token", FieldType.SELECT, true, List.of("VALID", "EXPIRED", "MISSING"), "VALID"),
			new PatternField("payloadState", "Etat du payload", FieldType.SELECT, true, List.of("VALID", "INVALID"), "VALID"),
			new PatternField(
				"processingTarget",
				"Traitement cible",
				FieldType.SELECT,
				true,
				List.of("REPORT_EXPORT", "BULK_IMPORT", "PASSWORD_RESET"),
				"REPORT_EXPORT"
			)
		));
	}

	@Override
	public PatternExecutionResult execute(PatternExecutionRequest request) {
		ChainConfig config = toConfig(request.parameters());
		PipelineRequest pipelineRequest = new PipelineRequest(
			config.requestName(),
			RequestTokenState.fromCode(config.tokenState()),
			RequestPayloadState.fromCode(config.payloadState()),
			ProcessingTarget.fromCode(config.processingTarget())
		);
		boolean useChain = WITH_CHAIN.equals(config.mode());
		List<String> logs = new ArrayList<>();
		List<PipelineStep> steps;
		String finalDecision;
		String handledBy;
		String stoppedAt;

		if (useChain) {
			RequestHandler auth = new AuthenticationHandler();
			RequestHandler validation = new ValidationHandler();
			RequestHandler processing = new ProcessingHandler();
			auth.linkWith(validation).linkWith(processing);

			logs.add("Construction de la chaine AuthenticationHandler -> ValidationHandler -> ProcessingHandler.");
			logs.add("La requete " + pipelineRequest.requestName() + " entre dans le premier maillon.");

			var execution = auth.handle(pipelineRequest);
			steps = execution.steps();
			finalDecision = execution.finalDecision();
			handledBy = execution.handledBy();
			stoppedAt = execution.stoppedAt();
		} else {
			logs.add("Mode sans Chain of Responsibility : un RequestController centralise tous les controles.");
			logs.add("La requete " + pipelineRequest.requestName() + " traverse une suite de if / else dans une seule classe.");
			steps = executeWithoutChain(pipelineRequest);
			PipelineStep lastStep = steps.get(steps.size() - 1);
			finalDecision = "HANDLED".equals(lastStep.status()) ? "ACCEPTED" : "REJECTED";
			handledBy = "HANDLED".equals(lastStep.status()) ? "RequestController" : lastStep.handlerLabel();
			stoppedAt = lastStep.handlerCode();
		}

		for (PipelineStep step : steps) {
			logs.add("Etape " + step.index() + " - " + step.handlerLabel() + " : " + step.detail());
		}

		List<String> visitedHandlers = steps.stream().map(PipelineStep::handlerCode).toList();
		long passedHandlers = steps.stream().filter(PipelineStep::passed).count();
		boolean accepted = "ACCEPTED".equals(finalDecision);
		String modeLabel = useChain ? "Avec Chain of Responsibility" : "Sans Chain of Responsibility";
		String decisionLabel = accepted
			? "Requete acceptee et traitee par " + handledBy + "."
			: "Requete stoppee par " + handledBy + ".";

		LinkedHashMap<String, Object> output = new LinkedHashMap<>();
		output.put("mode", config.mode());
		output.put("modeLabel", modeLabel);
		output.put("requestName", pipelineRequest.requestName());
		output.put("tokenState", pipelineRequest.tokenState().code());
		output.put("tokenLabel", pipelineRequest.tokenState().label());
		output.put("payloadState", pipelineRequest.payloadState().code());
		output.put("payloadLabel", pipelineRequest.payloadState().label());
		output.put("processingTarget", pipelineRequest.processingTarget().code());
		output.put("processingTargetLabel", pipelineRequest.processingTarget().label());
		output.put("finalDecision", finalDecision);
		output.put("decisionLabel", decisionLabel);
		output.put("accepted", accepted);
		output.put("handledBy", handledBy);
		output.put("stoppedAt", stoppedAt);
		output.put("visitedHandlers", visitedHandlers);
		output.put("passedHandlers", passedHandlers);
		output.put("stepCount", steps.size());
		output.put("steps", steps.stream().map(this::toStepMap).toList());

		return new PatternExecutionResult(
			getCode(),
			useChain
				? "Chaque maillon decide s il traite la requete, la rejette ou la transmet au suivant. La chaine reste modulaire et chaque controle est localise."
				: "Sans chaine, les controles restent regroupes dans un seul controller procedural, ce qui centralise les conditions et rigidifie le flux.",
			logs,
			output,
			buildVisualization(useChain, pipelineRequest, steps, accepted)
		);
	}

	private List<PipelineStep> executeWithoutChain(PipelineRequest request) {
		List<PipelineStep> steps = new ArrayList<>();

		if (request.tokenState() == RequestTokenState.VALID) {
			steps.add(new PipelineStep(
				1,
				"AUTH",
				"Inline auth check",
				"PASSED",
				true,
				"Le controller valide le token dans une condition inline."
			));
		} else {
			steps.add(new PipelineStep(
				1,
				"AUTH",
				"Inline auth check",
				"REJECTED",
				false,
				request.tokenState() == RequestTokenState.EXPIRED
					? "Le controller detecte un token expire et arrete la requete."
					: "Le controller detecte l absence de token et bloque la requete."
			));
			return List.copyOf(steps);
		}

		if (request.payloadState() == RequestPayloadState.VALID) {
			steps.add(new PipelineStep(
				2,
				"VALIDATION",
				"Inline validation check",
				"PASSED",
				true,
				"Le payload passe la validation inline du controller."
			));
		} else {
			steps.add(new PipelineStep(
				2,
				"VALIDATION",
				"Inline validation check",
				"REJECTED",
				false,
				"Le controller refuse le payload avant le traitement metier."
			));
			return List.copyOf(steps);
		}

		steps.add(new PipelineStep(
			3,
			"PROCESSING",
			"Inline processing branch",
			"HANDLED",
			true,
			request.processingTarget().handledMessage()
		));

		return List.copyOf(steps);
	}

	private VisualizationGraph buildVisualization(
		boolean useChain,
		PipelineRequest request,
		List<PipelineStep> steps,
		boolean accepted
	) {
		String activeHandler = steps.get(steps.size() - 1).handlerCode();

		List<VisualizationNode> nodes = List.of(
			new VisualizationNode(
				"request",
				request.requestName(),
				"client",
				Map.of("detail", request.processingTarget().label())
			),
			new VisualizationNode(
				"controller",
				useChain ? "Handler chain" : "RequestController",
				"context",
				Map.of("detail", useChain ? "maillons relies" : "if / else centralises")
			),
			new VisualizationNode(
				"auth",
				useChain ? "AuthenticationHandler" : "Auth check",
				"decorator",
				Map.of(
					"detail", request.tokenState().label(),
					"active", "AUTH".equals(activeHandler)
				)
			),
			new VisualizationNode(
				"validation",
				useChain ? "ValidationHandler" : "Validation check",
				"decorator",
				Map.of(
					"detail", request.payloadState().label(),
					"active", "VALIDATION".equals(activeHandler)
				)
			),
			new VisualizationNode(
				"processing",
				useChain ? "ProcessingHandler" : "Processing branch",
				"component",
				Map.of(
					"detail", request.processingTarget().label(),
					"active", "PROCESSING".equals(activeHandler)
				)
			),
			new VisualizationNode(
				"result",
				accepted ? "Requete acceptee" : "Requete rejetee",
				"output",
				Map.of("message", steps.get(steps.size() - 1).detail())
			)
		);

		List<VisualizationEdge> edges = useChain
			? List.of(
				new VisualizationEdge("request", "auth", "enter"),
				new VisualizationEdge("auth", "validation", "pass"),
				new VisualizationEdge("validation", "processing", "pass"),
				new VisualizationEdge("processing", "result", accepted ? "handle" : "stop")
			)
			: List.of(
				new VisualizationEdge("request", "controller", "dispatch"),
				new VisualizationEdge("controller", "auth", "check"),
				new VisualizationEdge("controller", "validation", "check"),
				new VisualizationEdge("controller", "processing", "branch"),
				new VisualizationEdge("processing", "result", accepted ? "handle" : "stop")
			);

		return new VisualizationGraph(nodes, edges);
	}

	private Map<String, Object> toStepMap(PipelineStep step) {
		return Map.of(
			"index", step.index(),
			"handlerCode", step.handlerCode(),
			"handlerLabel", step.handlerLabel(),
			"status", step.status(),
			"passed", step.passed(),
			"detail", step.detail()
		);
	}

	private ChainConfig toConfig(Map<String, Object> parameters) {
		if (parameters == null) {
			throw new InvalidPatternConfigurationException("Les parametres sont obligatoires.");
		}

		String mode = requireText(parameters, "mode");
		if (!WITH_CHAIN.equals(mode) && !WITHOUT_CHAIN.equals(mode)) {
			throw new InvalidPatternConfigurationException("mode doit valoir WITH_CHAIN ou WITHOUT_CHAIN.");
		}

		return new ChainConfig(
			mode,
			requireText(parameters, "requestName"),
			requireText(parameters, "tokenState"),
			requireText(parameters, "payloadState"),
			requireText(parameters, "processingTarget")
		);
	}

	private String requireText(Map<String, Object> parameters, String fieldName) {
		Object rawValue = parameters.get(fieldName);
		if (rawValue == null) {
			throw new InvalidPatternConfigurationException(fieldName + " est obligatoire.");
		}

		String normalized = rawValue.toString().trim();
		if (normalized.isEmpty()) {
			throw new InvalidPatternConfigurationException(fieldName + " ne peut pas etre vide.");
		}
		return normalized;
	}
}
