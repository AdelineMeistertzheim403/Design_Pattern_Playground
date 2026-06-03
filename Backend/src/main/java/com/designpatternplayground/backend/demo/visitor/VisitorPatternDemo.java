package com.designpatternplayground.backend.demo.visitor;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

import org.springframework.stereotype.Component;

import com.designpatternplayground.backend.common.exception.InvalidPatternConfigurationException;
import com.designpatternplayground.backend.demo.visitor.domain.StructureVisitor;
import com.designpatternplayground.backend.demo.visitor.domain.VisitorAnalysisType;
import com.designpatternplayground.backend.demo.visitor.domain.VisitorTraversalStep;
import com.designpatternplayground.backend.demo.visitor.domain.VisitorTreeNode;
import com.designpatternplayground.backend.demo.visitor.domain.VisitorTreePreset;
import com.designpatternplayground.backend.demo.visitor.domain.WorkspaceComponent;
import com.designpatternplayground.backend.demo.visitor.domain.WorkspaceFile;
import com.designpatternplayground.backend.demo.visitor.domain.WorkspaceFolder;
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
public class VisitorPatternDemo implements DesignPatternDemo {

	private static final String WITH_VISITOR = "WITH_VISITOR";
	private static final String WITHOUT_VISITOR = "WITHOUT_VISITOR";

	@Override
	public String getCode() {
		return "visitor";
	}

	@Override
	public PatternMetadata getMetadata() {
		return new PatternMetadata(
			getCode(),
			"Visitor",
			PatternType.BEHAVIORAL,
			"Ajoute des opérations sur une structure existante sans modifier les classes des éléments parcourus.",
			"Analyser un arbre de dossiers et de fichiers avec plusieurs visiteurs : compter, valoriser, rechercher ou scanner.",
			"ADVANCED"
		);
	}

	@Override
	public PatternSchema getSchema() {
		return new PatternSchema(List.of(
			new PatternField("mode", "Mode", FieldType.SELECT, true, List.of(WITH_VISITOR, WITHOUT_VISITOR), WITH_VISITOR),
			new PatternField(
				"treePreset",
				"Structure",
				FieldType.SELECT,
				true,
				List.of("ASSET_PACK", "TEAM_WORKSPACE", "MEDIA_ARCHIVE"),
				"ASSET_PACK"
			),
			new PatternField(
				"visitorType",
				"Visitor",
				FieldType.SELECT,
				true,
				List.of("COUNT_ELEMENTS", "CALCULATE_VALUE", "FIND_ELEMENT", "VIRUS_SCAN"),
				"COUNT_ELEMENTS"
			),
			new PatternField("searchTerm", "Terme de recherche", FieldType.TEXT, true, null, "virus")
		));
	}

	@Override
	public PatternExecutionResult execute(PatternExecutionRequest request) {
		VisitorConfig config = toConfig(request.parameters());
		boolean useVisitor = WITH_VISITOR.equals(config.mode());
		VisitorTreePreset treePreset = VisitorTreePreset.fromCode(config.treePreset());
		VisitorAnalysisType analysisType = VisitorAnalysisType.fromCode(config.visitorType());
		WorkspaceFolder root = treePreset.buildRoot();
		List<VisitorTraversalStep> traversalSteps;
		LinkedHashMap<String, Object> resultFields;
		List<String> matchedIds;
		List<String> logs = new ArrayList<>();

		if (useVisitor) {
			StructureVisitor visitor = analysisType.buildVisitor(config.searchTerm());
			traversalSteps = new ArrayList<>();
			root.accept(visitor, traversalSteps, 0);
			resultFields = visitor.buildResultFields();
			matchedIds = visitor.matchedIds();

			logs.add("Le client choisit un visitor puis lance accept(visitor) sur le root.");
			logs.add("Chaque élément dispatch automatiquement vers visitFolder ou visitFile sans switch métier dans le client.");
			logs.add("Le comportement change en remplaçant le visitor, pas en modifiant les classes de la structure.");
		} else {
			ManualAnalysisResult manualResult = analyzeWithoutVisitor(root, analysisType, config.searchTerm());
			traversalSteps = manualResult.steps();
			resultFields = manualResult.resultFields();
			matchedIds = manualResult.matchedIds();

			logs.add("Sans Visitor, le client centralise l analyse avec des instanceof et des branches par type.");
			logs.add("Ajouter un nouveau calcul impose alors de retoucher le moteur de traversal manuel.");
			logs.add("Le resultat peut etre juste, mais le couplage au modele grandit à chaque nouveau comportement.");
		}

		Set<String> visitedIds = traversalSteps.stream()
			.map(VisitorTraversalStep::nodeId)
			.collect(java.util.stream.Collectors.toCollection(LinkedHashSet::new));
		Set<String> matchedIdSet = new LinkedHashSet<>(matchedIds);
		List<VisitorTreeNode> treeNodes = new ArrayList<>();
		root.flatten(treeNodes, null, 0, visitedIds, matchedIdSet);

		logs.add(useVisitor
			? "Le visitor " + analysisType.label() + " parcourt " + visitedIds.size() + " noeuds sur la structure."
			: "Le parcours manuel visite " + visitedIds.size() + " noeuds avec une logique d analyse centralisee.");

		LinkedHashMap<String, Object> output = new LinkedHashMap<>();
		output.put("mode", config.mode());
		output.put("modeLabel", useVisitor ? "Avec Visitor" : "Sans Visitor");
		output.put("treePreset", treePreset.code());
		output.put("treeLabel", treePreset.label());
		output.put("treeDescription", treePreset.description());
		output.put("visitorType", analysisType.code());
		output.put("visitorLabel", analysisType.label());
		output.put("visitorDescription", analysisType.description());
		output.put("searchTerm", config.searchTerm());
		output.put("visitedCount", visitedIds.size());
		output.put("matchedCount", matchedIds.size());
		output.put("treeNodes", treeNodes);
		output.put("traversalSteps", toStepMaps(traversalSteps));
		output.put("matchedNodeIds", matchedIds);
		output.putAll(resultFields);

		return new PatternExecutionResult(
			getCode(),
			useVisitor
				? "Visitor ajoute de nouveaux comportements sur la structure sans modifier les classes des dossiers et fichiers. Le traversal reste stable, seule l analyse change."
				: "Sans Visitor, chaque nouvelle analyse ajoute des branches de type dans un moteur central. La structure reste la même, mais la logique grossit à chaque besoin.",
			logs,
			output,
			buildVisualization(useVisitor, analysisType, matchedIds.size())
		);
	}

	private VisitorConfig toConfig(Map<String, Object> parameters) {
		String mode = toStringValue(parameters.get("mode"), WITH_VISITOR).toUpperCase(Locale.ROOT);
		if (!WITH_VISITOR.equals(mode) && !WITHOUT_VISITOR.equals(mode)) {
			throw new InvalidPatternConfigurationException("Mode Visitor inconnu : " + mode);
		}

		return new VisitorConfig(
			mode,
			toStringValue(parameters.get("treePreset"), "ASSET_PACK"),
			toStringValue(parameters.get("visitorType"), "COUNT_ELEMENTS"),
			toStringValue(parameters.get("searchTerm"), "virus")
		);
	}

	private ManualAnalysisResult analyzeWithoutVisitor(WorkspaceComponent root, VisitorAnalysisType analysisType, String searchTerm) {
		ManualState state = new ManualState();
		List<VisitorTraversalStep> steps = new ArrayList<>();
		traverseWithoutVisitor(root, analysisType, searchTerm == null ? "" : searchTerm.toLowerCase(Locale.ROOT), state, steps, 0);

		LinkedHashMap<String, Object> resultFields = new LinkedHashMap<>();
		switch (analysisType) {
			case COUNT_ELEMENTS -> {
				resultFields.put("folderCount", state.folderCount);
				resultFields.put("fileCount", state.fileCount);
				resultFields.put("resultLabel", (state.folderCount + state.fileCount) + " éléments");
				resultFields.put("resultDetail", state.folderCount + " dossiers analyses et " + state.fileCount + " fichiers comptes.");
			}
			case CALCULATE_VALUE -> {
				resultFields.put("pricedFileCount", state.pricedFileCount);
				resultFields.put("totalValueMb", state.totalValueMb);
				resultFields.put("resultLabel", state.totalValueMb + " MB");
				resultFields.put("resultDetail", "Valeur totale calculee sur " + state.pricedFileCount + " fichiers.");
			}
			case FIND_ELEMENT -> {
				resultFields.put("found", state.foundLabel != null);
				resultFields.put("foundLabel", state.foundLabel == null ? "" : state.foundLabel);
				resultFields.put("resultLabel", state.foundLabel == null ? "Introuvable" : "Trouve");
				resultFields.put(
					"resultDetail",
					state.foundLabel == null
						? "Aucun élément ne correspond a \"" + searchTerm + "\"."
						: "Élément trouve : " + state.foundLabel + "."
				);
			}
			case VIRUS_SCAN -> {
				resultFields.put("infectedCount", state.infectedCount);
				resultFields.put("resultLabel", state.infectedCount == 0 ? "Aucune menace" : state.infectedCount + " menace(s)");
				resultFields.put(
					"resultDetail",
					state.infectedCount == 0
						? "Le scan manuel n a trouve aucun fichier infecte."
						: state.infectedCount + " fichier(s) infecte(s) detecte(s)."
				);
			}
		}

		return new ManualAnalysisResult(steps, resultFields, List.copyOf(state.matchedIds));
	}

	private void traverseWithoutVisitor(
		WorkspaceComponent component,
		VisitorAnalysisType analysisType,
		String searchTerm,
		ManualState state,
		List<VisitorTraversalStep> steps,
		int depth
	) {
		boolean matched = false;
		String detail;

		if (component instanceof WorkspaceFolder folder) {
			switch (analysisType) {
				case COUNT_ELEMENTS -> {
					state.folderCount++;
					detail = "Dossier compte par le moteur manuel.";
				}
				case CALCULATE_VALUE -> detail = "Dossier ouvert pour une addition manuelle.";
				case FIND_ELEMENT -> {
					matched = !searchTerm.isBlank() && folder.label().toLowerCase(Locale.ROOT).contains(searchTerm);
					if (matched && state.foundLabel == null) {
						state.foundLabel = folder.label();
						state.matchedIds.add(folder.id());
					}
					detail = matched ? "Cible trouvee dans un dossier." : "Dossier inspecte.";
				}
				case VIRUS_SCAN -> detail = "Scan manuel du dossier.";
				default -> detail = "Dossier inspecte.";
			}

			steps.add(new VisitorTraversalStep(folder.id(), folder.label(), folder.kind(), depth, detail, matched));

			if (analysisType == VisitorAnalysisType.FIND_ELEMENT && state.foundLabel != null) {
				return;
			}

			for (WorkspaceComponent child : folder.children()) {
				traverseWithoutVisitor(child, analysisType, searchTerm, state, steps, depth + 1);
				if (analysisType == VisitorAnalysisType.FIND_ELEMENT && state.foundLabel != null) {
					break;
				}
			}
			return;
		}

		WorkspaceFile file = (WorkspaceFile) component;
		switch (analysisType) {
			case COUNT_ELEMENTS -> {
				state.fileCount++;
				detail = "Fichier compte manuellement.";
			}
			case CALCULATE_VALUE -> {
				state.totalValueMb += file.sizeMb();
				state.pricedFileCount++;
				detail = file.sizeMb() + " MB ajoutes à la valeur manuelle.";
			}
			case FIND_ELEMENT -> {
				matched = !searchTerm.isBlank() && file.label().toLowerCase(Locale.ROOT).contains(searchTerm);
				if (matched && state.foundLabel == null) {
					state.foundLabel = file.label();
					state.matchedIds.add(file.id());
				}
				detail = matched ? "Élément recherche trouve." : "Fichier compare au terme de recherche.";
			}
			case VIRUS_SCAN -> {
				if (file.infected()) {
					state.infectedCount++;
					state.matchedIds.add(file.id());
					matched = true;
				}
				detail = matched ? "Menace detectee par le scan manuel." : "Fichier sain.";
			}
			default -> detail = "Fichier inspecte.";
		}

		steps.add(new VisitorTraversalStep(file.id(), file.label(), file.kind(), depth, detail, matched));
	}

	private List<Map<String, Object>> toStepMaps(List<VisitorTraversalStep> steps) {
		List<Map<String, Object>> mappedSteps = new ArrayList<>();
		for (int index = 0; index < steps.size(); index++) {
			VisitorTraversalStep step = steps.get(index);
			LinkedHashMap<String, Object> stepMap = new LinkedHashMap<>();
			stepMap.put("index", index + 1);
			stepMap.put("nodeId", step.nodeId());
			stepMap.put("nodeLabel", step.nodeLabel());
			stepMap.put("nodeKind", step.nodeKind());
			stepMap.put("depth", step.depth());
			stepMap.put("detail", step.detail());
			stepMap.put("matched", step.matched());
			mappedSteps.add(stepMap);
		}
		return mappedSteps;
	}

	private VisualizationGraph buildVisualization(boolean useVisitor, VisitorAnalysisType analysisType, int matchCount) {
		List<VisualizationNode> nodes = new ArrayList<>();
		List<VisualizationEdge> edges = new ArrayList<>();

		nodes.add(new VisualizationNode("client", "Structure Analyzer", "client", Map.of("detail", "explorer")));
		nodes.add(new VisualizationNode(
			useVisitor ? "visitor" : "manual",
			useVisitor ? analysisType.label() + " Visitor" : "Manual Analyzer",
			useVisitor ? "context" : "component",
			Map.of("detail", useVisitor ? "accept(visitor)" : "instanceof + switch")
		));
		nodes.add(new VisualizationNode("tree", "Workspace Tree", "cluster", Map.of("detail", "folders + files")));
		nodes.add(new VisualizationNode(
			"result",
			matchCount > 0 ? "Matches" : "Result",
			"output",
			Map.of("message", matchCount > 0 ? matchCount + " noeud(s) mis en evidence" : analysisType.label())
		));

		edges.add(new VisualizationEdge("client", useVisitor ? "visitor" : "manual", useVisitor ? "select visitor" : "manual rules"));
		edges.add(new VisualizationEdge(useVisitor ? "visitor" : "manual", "tree", "traverse"));
		edges.add(new VisualizationEdge("tree", "result", "aggregate"));

		return new VisualizationGraph(nodes, edges);
	}

	private String toStringValue(Object value, String defaultValue) {
		String candidate = value == null ? "" : value.toString().trim();
		return candidate.isEmpty() ? defaultValue : candidate;
	}

	private static final class ManualState {
		private int folderCount;
		private int fileCount;
		private int pricedFileCount;
		private int totalValueMb;
		private int infectedCount;
		private String foundLabel;
		private final List<String> matchedIds = new ArrayList<>();
	}

	private record ManualAnalysisResult(
		List<VisitorTraversalStep> steps,
		LinkedHashMap<String, Object> resultFields,
		List<String> matchedIds
	) {
	}
}
