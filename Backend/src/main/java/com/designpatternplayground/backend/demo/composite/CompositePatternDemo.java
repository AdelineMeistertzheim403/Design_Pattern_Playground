package com.designpatternplayground.backend.demo.composite;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.springframework.stereotype.Component;

import com.designpatternplayground.backend.common.exception.InvalidPatternConfigurationException;
import com.designpatternplayground.backend.demo.composite.domain.CompositeBlueprintProfile;
import com.designpatternplayground.backend.demo.composite.domain.CompositeNodeSnapshot;
import com.designpatternplayground.backend.demo.composite.domain.CompositeStep;
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
public class CompositePatternDemo implements DesignPatternDemo {

	private static final String WITH_COMPOSITE = "WITH_COMPOSITE";
	private static final String WITHOUT_COMPOSITE = "WITHOUT_COMPOSITE";

	@Override
	public String getCode() {
		return "composite";
	}

	@Override
	public PatternMetadata getMetadata() {
		return new PatternMetadata(
			"composite",
			"Composite",
			PatternType.STRUCTURAL,
			"Compose des objets en arbre pour traiter uniformement un element simple et un groupe d elements.",
			"Construire un explorateur de dossiers et fichiers ou une action appliquee au root descend naturellement sur toute la structure.",
			"INTERMEDIATE"
		);
	}

	@Override
	public PatternSchema getSchema() {
		return new PatternSchema(List.of(
			new PatternField("mode", "Mode", FieldType.SELECT, true, List.of(WITH_COMPOSITE, WITHOUT_COMPOSITE), WITH_COMPOSITE),
			new PatternField("rootName", "Nom du root", FieldType.TEXT, true, null, "workspace"),
			new PatternField(
				"blueprintCode",
				"Blueprint",
				FieldType.SELECT,
				true,
				List.of("GAME_ASSETS", "DESIGN_SYSTEM", "DOCS_SPACE"),
				"GAME_ASSETS"
			),
			new PatternField("extraLeafCount", "Feuilles supplementaires", FieldType.NUMBER, true, null, "3"),
			new PatternField("operationLabel", "Operation", FieldType.TEXT, true, null, "Scan tree")
		));
	}

	@Override
	public PatternExecutionResult execute(PatternExecutionRequest request) {
		CompositeConfig config = toConfig(request.parameters());
		boolean useComposite = WITH_COMPOSITE.equals(config.mode());
		CompositeBlueprintProfile blueprint = CompositeBlueprintProfile.fromCode(config.blueprintCode());
		List<CompositeNodeSnapshot> treeNodes = blueprint.buildTree(config.rootName(), config.extraLeafCount(), useComposite);

		int nodeCount = treeNodes.size();
		int fileCount = (int) treeNodes.stream().filter(node -> "FILE".equals(node.kind())).count();
		int containerCount = nodeCount - fileCount;
		int processedCount = (int) treeNodes.stream().filter(CompositeNodeSnapshot::processed).count();
		int missedCount = nodeCount - processedCount;
		int processedLeafCount = (int) treeNodes.stream().filter(node -> node.processed() && "FILE".equals(node.kind())).count();
		int totalSizeMb = treeNodes.stream().mapToInt(CompositeNodeSnapshot::sizeMb).sum();
		int processedSizeMb = treeNodes.stream().filter(CompositeNodeSnapshot::processed).mapToInt(CompositeNodeSnapshot::sizeMb).sum();
		int maxDepth = treeNodes.stream().mapToInt(CompositeNodeSnapshot::depth).max().orElse(0);

		List<CompositeStep> steps = buildSteps(config.operationLabel(), blueprint, useComposite, processedCount, nodeCount, processedLeafCount, fileCount, missedCount);
		List<String> logs = buildLogs(config.rootName(), config.operationLabel(), blueprint, useComposite, processedLeafCount, fileCount, missedCount);

		LinkedHashMap<String, Object> output = new LinkedHashMap<>();
		output.put("mode", config.mode());
		output.put("modeLabel", useComposite ? "Avec Composite" : "Sans Composite");
		output.put("rootName", config.rootName());
		output.put("blueprintCode", blueprint.code());
		output.put("blueprintLabel", blueprint.label());
		output.put("blueprintDescription", blueprint.description());
		output.put("operationLabel", config.operationLabel());
		output.put("uniformTraversal", useComposite);
		output.put("operationResultLabel", missedCount == 0 ? "Arbre complet traite" : "Sous-arbre manque");
		output.put("compositeBenefit", blueprint.compositeBenefit());
		output.put("manualGapDetail", blueprint.manualGapDetail());
		output.put("nodeCount", nodeCount);
		output.put("containerCount", containerCount);
		output.put("fileCount", fileCount);
		output.put("processedCount", processedCount);
		output.put("missedCount", missedCount);
		output.put("processedLeafCount", processedLeafCount);
		output.put("totalSizeMb", totalSizeMb);
		output.put("processedSizeMb", processedSizeMb);
		output.put("maxDepth", maxDepth);
		output.put("stepCount", steps.size());
		output.put("steps", steps.stream().map(this::toStepMap).toList());
		output.put("treeNodes", treeNodes.stream().map(this::toNodeMap).toList());

		return new PatternExecutionResult(
			getCode(),
			useComposite
				? "Composite permet de lancer la meme operation sur le root, un dossier ou un fichier sans changer le code client. La recursion descend naturellement dans tout l arbre."
				: "Sans Composite, le client distingue dossiers et fichiers et oublie facilement les descendants plus profonds. Le parcours reste partiel et plus fragile.",
			logs,
			output,
			buildVisualization(treeNodes, missedCount == 0)
		);
	}

	private List<CompositeStep> buildSteps(
		String operationLabel,
		CompositeBlueprintProfile blueprint,
		boolean useComposite,
		int processedCount,
		int nodeCount,
		int processedLeafCount,
		int fileCount,
		int missedCount
	) {
		List<CompositeStep> steps = new ArrayList<>();
		steps.add(new CompositeStep(
			1,
			"TRIGGER",
			"Declenchement",
			"TreeBuilderClient",
			"SENT",
			"Le client lance " + operationLabel + " sur le root du blueprint " + blueprint.label() + "."
		));
		steps.add(new CompositeStep(
			2,
			useComposite ? "COMPONENT_CALL" : "MANUAL_SPLIT",
			useComposite ? "Appel uniforme" : "Gestion separee",
			useComposite ? "WorkspaceComponent" : "TreeBuilderClient",
			useComposite ? "UNIFIED" : "MANUAL",
			useComposite
				? "Le meme contrat est applique au root, aux dossiers et aux feuilles."
				: "Le client distingue dossier et fichier avec des branches manuelles."
		));
		steps.add(new CompositeStep(
			3,
			"TOP_LEVEL",
			"Premier niveau",
			"workspace",
			"READY",
			processedCount >= 4
				? "Le premier niveau est visite sans probleme."
				: "Le premier niveau demarre, mais la navigation reste fragile."
		));
		steps.add(new CompositeStep(
			4,
			useComposite ? "RECURSIVE_WALK" : "DESCENDANT_GAP",
			useComposite ? "Descente recursive" : "Sous-arbre oublie",
			useComposite ? "CompositeFolder" : "TreeBuilderClient",
			useComposite ? "READY" : "MISSED",
			useComposite
				? "Les appels descendent automatiquement vers tous les descendants."
				: blueprint.manualGapDetail()
		));
		steps.add(new CompositeStep(
			5,
			"AGGREGATE",
			"Agregation",
			"workspace",
			missedCount == 0 ? "READY" : "PARTIAL",
			processedLeafCount + " feuille(s) sur " + fileCount + " consolidees."
		));
		steps.add(new CompositeStep(
			6,
			"RESULT",
			"Verdict",
			"TreeBuilderClient",
			missedCount == 0 ? "READY" : "PARTIAL",
			missedCount == 0
				? "Le root produit un resultat complet sur toute la structure."
				: "Le resultat reste partiel car " + missedCount + " noeud(s) profond(s) n ont pas ete traites."
		));
		return steps;
	}

	private List<String> buildLogs(
		String rootName,
		String operationLabel,
		CompositeBlueprintProfile blueprint,
		boolean useComposite,
		int processedLeafCount,
		int fileCount,
		int missedCount
	) {
		List<String> logs = new ArrayList<>();
		logs.add("Le client lance " + operationLabel + " sur le root " + rootName + ".");
		logs.add(useComposite
			? "Le root, les dossiers et les fichiers partagent le meme contrat CompositeComponent."
			: "Sans Composite, le client garde des branches separees pour les dossiers et les fichiers.");
		logs.add(useComposite
			? blueprint.compositeBenefit()
			: blueprint.manualGapDetail());
		logs.add("Feuilles traitees : " + processedLeafCount + " / " + fileCount + ".");
		logs.add(missedCount == 0
			? "Aucun sous-arbre n est perdu pendant le parcours."
			: missedCount + " noeud(s) restent hors parcours a cause du traitement manuel.");
		return logs;
	}

	private VisualizationGraph buildVisualization(List<CompositeNodeSnapshot> treeNodes, boolean complete) {
		List<VisualizationNode> nodes = new ArrayList<>();
		List<VisualizationEdge> edges = new ArrayList<>();

		for (CompositeNodeSnapshot node : treeNodes) {
			String type = switch (node.kind()) {
				case "ROOT" -> "context";
				case "FOLDER" -> "cluster";
				default -> "event";
			};

			nodes.add(new VisualizationNode(
				node.id(),
				node.label(),
				type,
				Map.of(
					"detail", node.kind().equals("FILE") ? node.sizeMb() + " MB" : node.kind().toLowerCase(Locale.ROOT),
					"active", node.processed()
				)
			));

			if (node.parentId() != null) {
				edges.add(new VisualizationEdge(node.parentId(), node.id(), "contains"));
			}
		}

		nodes.add(new VisualizationNode(
			"result",
			complete ? "Tree complete" : "Tree partial",
			"output",
			Map.of("message", complete ? "all descendants reached" : "deep nodes missed")
		));
		edges.add(new VisualizationEdge("root", "result", complete ? "aggregate" : "partial"));

		return new VisualizationGraph(nodes, edges);
	}

	private Map<String, Object> toStepMap(CompositeStep step) {
		return Map.of(
			"index", step.index(),
			"stageCode", step.stageCode(),
			"title", step.title(),
			"actorLabel", step.actorLabel(),
			"status", step.status(),
			"detail", step.detail()
		);
	}

	private Map<String, Object> toNodeMap(CompositeNodeSnapshot node) {
		LinkedHashMap<String, Object> map = new LinkedHashMap<>();
		map.put("id", node.id());
		map.put("parentId", node.parentId());
		map.put("label", node.label());
		map.put("kind", node.kind());
		map.put("depth", node.depth());
		map.put("sizeMb", node.sizeMb());
		map.put("processed", node.processed());
		return map;
	}

	private CompositeConfig toConfig(Map<String, Object> parameters) {
		if (parameters == null) {
			throw new InvalidPatternConfigurationException("Les parametres Composite sont obligatoires.");
		}

		String mode = requireText(parameters, "mode").toUpperCase(Locale.ROOT);
		if (!WITH_COMPOSITE.equals(mode) && !WITHOUT_COMPOSITE.equals(mode)) {
			throw new InvalidPatternConfigurationException("mode doit valoir WITH_COMPOSITE ou WITHOUT_COMPOSITE.");
		}

		int extraLeafCount = requireNumber(parameters, "extraLeafCount");
		if (extraLeafCount < 0 || extraLeafCount > 8) {
			throw new InvalidPatternConfigurationException("extraLeafCount doit etre compris entre 0 et 8.");
		}

		return new CompositeConfig(
			mode,
			requireText(parameters, "rootName"),
			requireText(parameters, "blueprintCode").toUpperCase(Locale.ROOT),
			extraLeafCount,
			requireText(parameters, "operationLabel")
		);
	}

	private int requireNumber(Map<String, Object> parameters, String fieldName) {
		Object rawValue = parameters.get(fieldName);
		if (rawValue == null) {
			throw new InvalidPatternConfigurationException(fieldName + " est obligatoire.");
		}

		try {
			return Integer.parseInt(rawValue.toString().trim());
		} catch (NumberFormatException exception) {
			throw new InvalidPatternConfigurationException(fieldName + " doit etre numerique.");
		}
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
