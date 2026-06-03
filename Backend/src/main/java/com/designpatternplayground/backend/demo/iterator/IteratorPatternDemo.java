package com.designpatternplayground.backend.demo.iterator;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.springframework.stereotype.Component;

import com.designpatternplayground.backend.common.exception.InvalidPatternConfigurationException;
import com.designpatternplayground.backend.demo.iterator.domain.IteratorCollectionPreset;
import com.designpatternplayground.backend.demo.iterator.domain.IteratorItemSnapshot;
import com.designpatternplayground.backend.demo.iterator.domain.IteratorTraversalStep;
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
public class IteratorPatternDemo implements DesignPatternDemo {

	private static final String WITH_ITERATOR = "WITH_ITERATOR";
	private static final String WITHOUT_ITERATOR = "WITHOUT_ITERATOR";
	private static final List<String> NAVIGATION_ACTIONS = List.of("START", "NEXT", "NEXT", "PREVIOUS", "NEXT", "NEXT");

	@Override
	public String getCode() {
		return "iterator";
	}

	@Override
	public PatternMetadata getMetadata() {
		return new PatternMetadata(
			getCode(),
			"Iterator",
			PatternType.BEHAVIORAL,
			"Expose un parcours séquentiel sur une collection sans révéler sa structure interne ni dupliquer la logique de navigation.",
			"Parcourir une liste ou un arbre avec un curseur next / previous stable, même quand la structure sous-jacente change.",
			"INTERMEDIATE"
		);
	}

	@Override
	public PatternSchema getSchema() {
		return new PatternSchema(List.of(
			new PatternField("mode", "Mode", FieldType.SELECT, true, List.of(WITH_ITERATOR, WITHOUT_ITERATOR), WITH_ITERATOR),
			new PatternField(
				"collectionCode",
				"Collection",
				FieldType.SELECT,
				true,
				List.of("QUEST_LOG", "ASSET_TREE", "TOOLBELT"),
				"ASSET_TREE"
			),
			new PatternField("explorerName", "Nom de l explorateur", FieldType.TEXT, true, null, "Traversal Explorer")
		));
	}

	@Override
	public PatternExecutionResult execute(PatternExecutionRequest request) {
		IteratorConfig config = toConfig(request.parameters());
		boolean useIterator = WITH_ITERATOR.equals(config.mode());
		IteratorCollectionPreset preset = IteratorCollectionPreset.fromCode(config.collectionCode());
		List<IteratorItemSnapshot> items = preset.items();
		List<IteratorTraversalStep> steps = buildSteps(config.explorerName(), preset, useIterator, items);
		int finalPointerIndex = steps.isEmpty() ? 0 : steps.get(steps.size() - 1).pointerIndex();
		IteratorItemSnapshot currentItem = items.get(Math.max(0, Math.min(finalPointerIndex, items.size() - 1)));
		long previousActions = steps.stream().filter(step -> "PREVIOUS".equals(step.action())).count();
		long unstableBacktracks = steps.stream().filter(step -> "PREVIOUS".equals(step.action()) && !step.previousStable()).count();
		List<String> visitedIds = steps.stream().map(IteratorTraversalStep::targetId).distinct().toList();
		List<String> cursorTrail = steps.stream().map(IteratorTraversalStep::targetId).toList();
		List<String> logs = buildLogs(config.explorerName(), preset, useIterator, unstableBacktracks);

		LinkedHashMap<String, Object> output = new LinkedHashMap<>();
		output.put("mode", config.mode());
		output.put("modeLabel", useIterator ? "Avec Iterator" : "Sans Iterator");
		output.put("explorerName", config.explorerName());
		output.put("collectionCode", preset.code());
		output.put("collectionLabel", preset.label());
		output.put("collectionDescription", preset.description());
		output.put("iteratorBenefit", preset.iteratorBenefit());
		output.put("manualDriftDetail", preset.manualDriftDetail());
		output.put("previousSupported", useIterator);
		output.put("stablePrevious", unstableBacktracks == 0);
		output.put("itemCount", items.size());
		output.put("visitedCount", visitedIds.size());
		output.put("finalPointerIndex", finalPointerIndex);
		output.put("currentItemId", currentItem.id());
		output.put("currentItemLabel", currentItem.label());
		output.put("resultLabel", useIterator ? "Traversal stable" : "Traversal manuelle");
		output.put("previousActionCount", previousActions);
		output.put("unstableBacktrackCount", unstableBacktracks);
		output.put("navigationPlan", NAVIGATION_ACTIONS);
		output.put("items", items.stream().map(this::toItemMap).toList());
		output.put("steps", steps.stream().map(this::toStepMap).toList());
		output.put("cursorTrail", cursorTrail);
		output.put("visitedIds", visitedIds);
		output.put("stepCount", steps.size());

		return new PatternExecutionResult(
			getCode(),
			useIterator
				? "Iterator encapsule next() et previous() dans un objet de parcours. Le client avance sur la collection sans connaitre la structure ni recalculer les positions."
				: "Sans Iterator, le client gere lui-même les index et le retour arriere. Le parcours fonctionne, mais la logique de navigation se repand vite dans le code appelant.",
			logs,
			output,
			buildVisualization(useIterator, preset, currentItem)
		);
	}

	private IteratorConfig toConfig(Map<String, Object> parameters) {
		String mode = toStringValue(parameters.get("mode"), WITH_ITERATOR).toUpperCase(Locale.ROOT);
		if (!WITH_ITERATOR.equals(mode) && !WITHOUT_ITERATOR.equals(mode)) {
			throw new InvalidPatternConfigurationException("Mode Iterator inconnu : " + mode);
		}

		return new IteratorConfig(
			mode,
			toStringValue(parameters.get("collectionCode"), "ASSET_TREE"),
			toStringValue(parameters.get("explorerName"), "Traversal Explorer")
		);
	}

	private List<IteratorTraversalStep> buildSteps(
		String explorerName,
		IteratorCollectionPreset preset,
		boolean useIterator,
		List<IteratorItemSnapshot> items
	) {
		List<IteratorTraversalStep> steps = new ArrayList<>();
		int pointerIndex = 0;

		for (int index = 0; index < NAVIGATION_ACTIONS.size(); index++) {
			String action = NAVIGATION_ACTIONS.get(index);
			boolean previousStable = true;
			String detail;

			switch (action) {
				case "START" -> detail = explorerName + " positionne le curseur sur " + items.get(pointerIndex).label() + ".";
				case "NEXT" -> {
					pointerIndex = Math.min(pointerIndex + 1, items.size() - 1);
					detail = useIterator
						? "iterator.next() avance proprement vers " + items.get(pointerIndex).label() + "."
						: "Le client incremente un index manuel pour atteindre " + items.get(pointerIndex).label() + ".";
				}
				case "PREVIOUS" -> {
					if (useIterator) {
						pointerIndex = Math.max(pointerIndex - 1, 0);
						detail = "iterator.previous() revient directement sur " + items.get(pointerIndex).label() + ".";
					} else {
						pointerIndex = Math.max(pointerIndex - 1, 0);
						previousStable = false;
						detail = preset.manualDriftDetail();
					}
				}
				default -> detail = "Navigation inconnue.";
			}

			IteratorItemSnapshot target = items.get(pointerIndex);
			steps.add(new IteratorTraversalStep(
				index + 1,
				action,
				useIterator ? "CollectionIterator" : "TraversalClient",
				target.id(),
				target.label(),
				pointerIndex,
				previousStable,
				detail
			));
		}

		return steps;
	}

	private List<String> buildLogs(
		String explorerName,
		IteratorCollectionPreset preset,
		boolean useIterator,
		long unstableBacktracks
	) {
		List<String> logs = new ArrayList<>();
		logs.add(explorerName + " explore " + preset.label() + ".");
		logs.add(useIterator
			? "Le client demande next() / previous() sans connaitre la representation interne de la collection."
			: "Sans iterator, le client manipule directement la position courante et recalcule les retours arriere.");
		logs.add(useIterator ? preset.iteratorBenefit() : preset.manualDriftDetail());
		logs.add(unstableBacktracks == 0
			? "Le retour arriere reste stable sur tout le parcours."
			: unstableBacktracks + " retour(s) arriere demandent une logique manuelle fragile.");
		return logs;
	}

	private VisualizationGraph buildVisualization(
		boolean useIterator,
		IteratorCollectionPreset preset,
		IteratorItemSnapshot currentItem
	) {
		return new VisualizationGraph(
			List.of(
				new VisualizationNode("client", "TraversalClient", "client", Map.of("detail", "asks next / previous")),
				new VisualizationNode(
					"iterator",
					useIterator ? "CollectionIterator" : "ManualIndexWalker",
					"context",
					Map.of("detail", useIterator ? "encapsulated traversal" : "client-owned cursor", "active", useIterator)
				),
				new VisualizationNode("collection", preset.label(), "cluster", Map.of("detail", preset.code().toLowerCase(Locale.ROOT))),
				new VisualizationNode("cursor", currentItem.label(), "component", Map.of("detail", "cursor on " + currentItem.linearIndex(), "active", true)),
				new VisualizationNode(
					"result",
					useIterator ? "Stable traversal" : "Manual backtrack",
					"output",
					Map.of("message", useIterator ? "next / previous hidden behind iterator" : "navigation leaks to client")
				)
			),
			List.of(
				new VisualizationEdge("client", "iterator", "navigate"),
				new VisualizationEdge("iterator", "collection", "iterate"),
				new VisualizationEdge("collection", "cursor", "current"),
				new VisualizationEdge("iterator", "result", useIterator ? "stable" : "fragile")
			)
		);
	}

	private Map<String, Object> toItemMap(IteratorItemSnapshot item) {
		LinkedHashMap<String, Object> map = new LinkedHashMap<>();
		map.put("id", item.id());
		map.put("label", item.label());
		map.put("kind", item.kind());
		map.put("depth", item.depth());
		map.put("linearIndex", item.linearIndex());
		return map;
	}

	private Map<String, Object> toStepMap(IteratorTraversalStep step) {
		LinkedHashMap<String, Object> map = new LinkedHashMap<>();
		map.put("index", step.index());
		map.put("action", step.action());
		map.put("actorLabel", step.actorLabel());
		map.put("targetId", step.targetId());
		map.put("targetLabel", step.targetLabel());
		map.put("pointerIndex", step.pointerIndex());
		map.put("previousStable", step.previousStable());
		map.put("detail", step.detail());
		return map;
	}

	private String toStringValue(Object value, String defaultValue) {
		String candidate = value == null ? "" : value.toString().trim();
		return candidate.isEmpty() ? defaultValue : candidate;
	}
}
