package com.designpatternplayground.backend.demo.template;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.springframework.stereotype.Component;

import com.designpatternplayground.backend.common.exception.InvalidPatternConfigurationException;
import com.designpatternplayground.backend.demo.template.domain.TemplateMethodStep;
import com.designpatternplayground.backend.demo.template.domain.TemplateWorkflowProfile;
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
public class TemplateMethodPatternDemo implements DesignPatternDemo {

	private static final String WITH_TEMPLATE_METHOD = "WITH_TEMPLATE_METHOD";
	private static final String WITHOUT_TEMPLATE_METHOD = "WITHOUT_TEMPLATE_METHOD";

	@Override
	public String getCode() {
		return "template";
	}

	@Override
	public PatternMetadata getMetadata() {
		return new PatternMetadata(
			getCode(),
			"Template Method",
			PatternType.BEHAVIORAL,
			"Definit le squelette stable d un algorithme puis laisse certaines etapes varier dans les sous-classes.",
			"Construire un workflow prepare -> execute -> finalise dans lequel seule l etape centrale change selon le scenario choisi.",
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
				List.of(WITH_TEMPLATE_METHOD, WITHOUT_TEMPLATE_METHOD),
				WITH_TEMPLATE_METHOD
			),
			new PatternField(
				"workflowCode",
				"Etape personnalisee",
				FieldType.SELECT,
				true,
				List.of("RELEASE_PIPELINE", "SECURITY_AUDIT", "DATA_SYNC"),
				"RELEASE_PIPELINE"
			),
			new PatternField(
				"workflowName",
				"Nom du workflow",
				FieldType.TEXT,
				true,
				null,
				"Workflow Builder"
			)
		));
	}

	@Override
	public PatternExecutionResult execute(PatternExecutionRequest request) {
		TemplateMethodConfig config = toConfig(request.parameters());
		TemplateWorkflowProfile profile = TemplateWorkflowProfile.fromCode(config.workflowCode());
		boolean useTemplateMethod = WITH_TEMPLATE_METHOD.equals(config.mode());
		boolean finalizationGuaranteed = useTemplateMethod;
		boolean stableWorkflow = useTemplateMethod;
		int duplicateBoilerplateCount = useTemplateMethod ? 1 : 3;
		int latencyMs = useTemplateMethod ? 240 : 390;
		List<TemplateMethodStep> steps = buildSteps(config.workflowName(), profile, useTemplateMethod, finalizationGuaranteed);
		List<String> logs = buildLogs(config.workflowName(), profile, useTemplateMethod, finalizationGuaranteed);

		LinkedHashMap<String, Object> output = new LinkedHashMap<>();
		output.put("mode", config.mode());
		output.put("modeLabel", useTemplateMethod ? "Avec Template Method" : "Sans Template Method");
		output.put("workflowName", config.workflowName());
		output.put("workflowCode", profile.code());
		output.put("workflowLabel", profile.label());
		output.put("workflowDescription", profile.description());
		output.put("ambianceLabel", profile.ambianceLabel());
		output.put("prepareLabel", profile.prepareLabel());
		output.put("prepareDetail", profile.prepareDetail());
		output.put("executeLabel", profile.executeLabel());
		output.put("executeDetail", profile.executeDetail());
		output.put("finalizeLabel", profile.finalizeLabel());
		output.put("finalizeDetail", profile.finalizeDetail());
		output.put("manualDriftDetail", profile.manualDriftDetail());
		output.put("skeletonLabel", useTemplateMethod ? "AbstractWorkflowTemplate" : "ManualWorkflowCopy");
		output.put("clientLabel", "WorkflowClient");
		output.put("resultLabel", stableWorkflow ? profile.successLabel() : "Workflow fragile");
		output.put("templateUsed", useTemplateMethod);
		output.put("finalizationGuaranteed", finalizationGuaranteed);
		output.put("stableWorkflow", stableWorkflow);
		output.put("duplicateBoilerplateCount", duplicateBoilerplateCount);
		output.put("latencyMs", latencyMs);
		output.put("fixedStageCount", 3);
		output.put("stepCount", steps.size());
		output.put("steps", steps.stream().map(this::toStepMap).toList());

		return new PatternExecutionResult(
			getCode(),
			useTemplateMethod
				? "Template Method conserve un squelette prepare -> execute -> finalise. Le workflow specialise ne redefinit que l etape centrale, sans dupliquer toute la recette."
				: "Sans Template Method, chaque workflow recopie la sequence complete. La logique commune derive, la finalisation devient fragile et le code se repete.",
			logs,
			output,
			buildVisualization(useTemplateMethod, finalizationGuaranteed)
		);
	}

	private TemplateMethodConfig toConfig(Map<String, Object> parameters) {
		String mode = toStringValue(parameters.get("mode"), WITH_TEMPLATE_METHOD).toUpperCase(Locale.ROOT);
		if (!WITH_TEMPLATE_METHOD.equals(mode) && !WITHOUT_TEMPLATE_METHOD.equals(mode)) {
			throw new InvalidPatternConfigurationException("Mode Template Method inconnu : " + mode);
		}

		return new TemplateMethodConfig(
			mode,
			toStringValue(parameters.get("workflowCode"), "RELEASE_PIPELINE"),
			toStringValue(parameters.get("workflowName"), "Workflow Builder")
		);
	}

	private String toStringValue(Object value, String defaultValue) {
		String candidate = value == null ? "" : value.toString().trim();
		return candidate.isEmpty() ? defaultValue : candidate;
	}

	private List<TemplateMethodStep> buildSteps(
		String workflowName,
		TemplateWorkflowProfile profile,
		boolean useTemplateMethod,
		boolean finalizationGuaranteed
	) {
		List<TemplateMethodStep> steps = new ArrayList<>();
		steps.add(new TemplateMethodStep(
			1,
			"CLIENT",
			"Declenchement",
			"WorkflowClient",
			"SENT",
			"Le client lance " + workflowName + " puis delegue l orchestration a " + (useTemplateMethod ? "un squelette commun." : "un workflow copie-colle."),
			false
		));
		steps.add(new TemplateMethodStep(
			2,
			"PREPARE",
			profile.prepareLabel(),
			useTemplateMethod ? "AbstractWorkflowTemplate" : "ManualWorkflowCopy",
			"READY",
			useTemplateMethod
				? profile.prepareDetail()
				: profile.prepareDetail() + " Cette phase est recopied dans chaque workflow manuel.",
			false
		));
		steps.add(new TemplateMethodStep(
			3,
			"EXECUTE",
			profile.executeLabel(),
			profile.label(),
			"CUSTOM",
			profile.executeDetail(),
			true
		));
		steps.add(new TemplateMethodStep(
			4,
			"FINALIZE",
			profile.finalizeLabel(),
			useTemplateMethod ? "AbstractWorkflowTemplate" : "ManualWorkflowCopy",
			finalizationGuaranteed ? "READY" : "FRAGILE",
			finalizationGuaranteed ? profile.finalizeDetail() : profile.manualDriftDetail(),
			false
		));
		steps.add(new TemplateMethodStep(
			5,
			"RESULT",
			"Etat final",
			useTemplateMethod ? "WorkflowTemplate" : "ManualWorkflow",
			finalizationGuaranteed ? "STABLE" : "WARNING",
			finalizationGuaranteed
				? "Le workflow reste lisible : memes etapes communes, variation concentree sur execute()."
				: "Le workflow aboutit, mais la fin de sequence n est plus garantie et la duplication augmente le risque de derive.",
			false
		));
		return steps;
	}

	private List<String> buildLogs(
		String workflowName,
		TemplateWorkflowProfile profile,
		boolean useTemplateMethod,
		boolean finalizationGuaranteed
	) {
		List<String> logs = new ArrayList<>();
		logs.add("Le client lance " + workflowName + " sur le scenario " + profile.label() + ".");
		logs.add(useTemplateMethod
			? "Le squelette commun enchaine prepare() -> executeSpecificStep() -> finalize()."
			: "Sans template method, le workflow re-implemente prepare, execute et finalize dans du code copie-colle.");
		logs.add("Prepare -> " + profile.prepareDetail());
		logs.add("Execute -> " + profile.executeDetail());
		logs.add("Finalize -> " + (finalizationGuaranteed ? profile.finalizeDetail() : profile.manualDriftDetail()));
		return logs;
	}

	private Map<String, Object> toStepMap(TemplateMethodStep step) {
		LinkedHashMap<String, Object> map = new LinkedHashMap<>();
		map.put("index", step.index());
		map.put("stageCode", step.stageCode());
		map.put("stageLabel", step.stageLabel());
		map.put("actorLabel", step.actorLabel());
		map.put("status", step.status());
		map.put("detail", step.detail());
		map.put("variableStage", step.variableStage());
		return map;
	}

	private VisualizationGraph buildVisualization(boolean useTemplateMethod, boolean finalizationGuaranteed) {
		List<VisualizationNode> nodes = List.of(
			new VisualizationNode("client", "WorkflowClient", "client", Map.of("detail", "launch workflow")),
			new VisualizationNode(
				"skeleton",
				useTemplateMethod ? "AbstractWorkflowTemplate" : "ManualWorkflowCopy",
				"context",
				Map.of("detail", useTemplateMethod ? "fixed skeleton" : "copy pasted flow", "active", useTemplateMethod)
			),
			new VisualizationNode("prepare", "Prepare", "component", Map.of("detail", "shared setup", "active", true)),
			new VisualizationNode("execute", "Execute", "component", Map.of("detail", "custom hook", "active", true)),
			new VisualizationNode(
				"finalize",
				"Finalize",
				"component",
				Map.of("detail", finalizationGuaranteed ? "guaranteed" : "fragile cleanup", "active", finalizationGuaranteed)
			),
			new VisualizationNode(
				"result",
				finalizationGuaranteed ? "Workflow stable" : "Workflow fragile",
				"output",
				Map.of("message", finalizationGuaranteed ? "stable algorithm" : "duplicated logic drift")
			)
		);

		List<VisualizationEdge> edges = new ArrayList<>();
		edges.add(new VisualizationEdge("client", "skeleton", "start"));
		edges.add(new VisualizationEdge("skeleton", "prepare", "prepare"));
		edges.add(new VisualizationEdge("prepare", "execute", "template step"));
		edges.add(new VisualizationEdge("execute", "finalize", finalizationGuaranteed ? "finalize" : "manual finalize"));
		edges.add(new VisualizationEdge("finalize", "result", finalizationGuaranteed ? "stable" : "warning"));

		return new VisualizationGraph(nodes, edges);
	}
}
