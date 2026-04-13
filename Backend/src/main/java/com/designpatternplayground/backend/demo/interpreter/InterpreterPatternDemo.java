package com.designpatternplayground.backend.demo.interpreter;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;

import org.springframework.stereotype.Component;

import com.designpatternplayground.backend.common.exception.InvalidPatternConfigurationException;
import com.designpatternplayground.backend.demo.interpreter.domain.InterpreterContext;
import com.designpatternplayground.backend.demo.interpreter.domain.InterpreterFacing;
import com.designpatternplayground.backend.demo.interpreter.domain.InterpreterObjective;
import com.designpatternplayground.backend.demo.interpreter.domain.InterpreterStep;
import com.designpatternplayground.backend.demo.interpreter.domain.PrimitiveExpression;
import com.designpatternplayground.backend.demo.interpreter.domain.PrimitiveInstructionType;
import com.designpatternplayground.backend.demo.interpreter.domain.RepeatExpression;
import com.designpatternplayground.backend.demo.interpreter.domain.ScriptExpression;
import com.designpatternplayground.backend.demo.interpreter.domain.ScriptParser;
import com.designpatternplayground.backend.demo.interpreter.domain.ScriptTreeNode;
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
public class InterpreterPatternDemo implements DesignPatternDemo {

	private static final String WITH_INTERPRETER = "WITH_INTERPRETER";
	private static final String WITHOUT_INTERPRETER = "WITHOUT_INTERPRETER";
	private static final int BOARD_WIDTH = 6;
	private static final int BOARD_HEIGHT = 6;
	private static final int START_X = 1;
	private static final int START_Y = 2;
	private static final InterpreterFacing START_FACING = InterpreterFacing.EAST;

	@Override
	public String getCode() {
		return "interpreter";
	}

	@Override
	public PatternMetadata getMetadata() {
		return new PatternMetadata(
			getCode(),
			"Interpreter",
			PatternType.BEHAVIORAL,
			"Interprete un mini langage en transformant chaque instruction en expression executable sur un contexte.",
			"Ecrire un petit script MOVE / TURN / ATTACK / REPEAT puis voir si le personnage atteint la cible selon qu un interprete complet existe ou non.",
			"ADVANCED"
		);
	}

	@Override
	public PatternSchema getSchema() {
		return new PatternSchema(List.of(
			new PatternField("mode", "Mode", FieldType.SELECT, true, List.of(WITH_INTERPRETER, WITHOUT_INTERPRETER), WITH_INTERPRETER),
			new PatternField("missionName", "Nom de la mission", FieldType.TEXT, true, null, "Target Dummy Drill"),
			new PatternField(
				"objective",
				"Objectif",
				FieldType.SELECT,
				true,
				List.of("TARGET_DUMMY", "RELAY_BEACON", "GATE_SWITCH"),
				"TARGET_DUMMY"
			),
			new PatternField(
				"scriptLines",
				"Script",
				FieldType.LIST,
				true,
				null,
				"MOVE 1\nTURN RIGHT\nMOVE 1\nTURN LEFT\nREPEAT 2 {\nMOVE 1\n}\nATTACK"
			)
		));
	}

	@Override
	public PatternExecutionResult execute(PatternExecutionRequest request) {
		InterpreterConfig config = toConfig(request.parameters());
		boolean useInterpreter = WITH_INTERPRETER.equals(config.mode());
		InterpreterObjective objective = InterpreterObjective.fromCode(config.objective());
		InterpreterContext context = new InterpreterContext(
			BOARD_WIDTH,
			BOARD_HEIGHT,
			START_X,
			START_Y,
			START_FACING,
			objective
		);
		List<InterpreterStep> steps;
		List<ScriptTreeNode> treeNodes;
		List<Map<String, Object>> skippedLines;
		List<String> logs = new ArrayList<>();

		if (useInterpreter) {
			List<ScriptExpression> expressions = new ScriptParser().parse(config.scriptLines());
			steps = new ArrayList<>();
			for (ScriptExpression expression : expressions) {
				expression.interpret(context, steps);
			}
			treeNodes = buildTreeNodes(expressions);
			skippedLines = List.of();

			logs.add("Le client confie le script a un parseur qui construit un arbre d expressions executable.");
			logs.add("Les blocs REPEAT sont composes, puis rejoues " + countRepeatExecutions(expressions) + " fois sans dupliquer le code client.");
			logs.add("Chaque expression interprete le meme contexte de mission avec position, orientation et cible.");
		} else {
			ManualExecutionResult manualResult = executeWithoutInterpreter(config.scriptLines(), context);
			steps = manualResult.steps();
			treeNodes = manualResult.treeNodes();
			skippedLines = manualResult.skippedLines();

			logs.add("Sans Interpreter, le client parcourt les lignes a la main avec une suite de conditions.");
			logs.add("Les lignes REPEAT et les accolades sont ignorees car aucune structure de langage n est comprise.");
			logs.add("Le mini langage devient vite fragile : une simple extension casse la lecture imperative.");
		}

		logs.add(context.objectiveCompleted()
			? "Objectif accompli : la cible " + objective.targetLabel() + " est atteinte" + (objective.requiresAttack() ? " et attaquee." : ".")
			: "Objectif incomplet : la cible n a pas ete atteinte ou l attaque finale manque.");

		LinkedHashMap<String, Object> output = new LinkedHashMap<>();
		output.put("mode", config.mode());
		output.put("modeLabel", useInterpreter ? "Avec Interpreter" : "Sans Interpreter");
		output.put("missionName", config.missionName());
		output.put("objectiveCode", objective.code());
		output.put("objectiveLabel", objective.label());
		output.put("objectiveDescription", objective.description());
		output.put("targetLabel", objective.targetLabel());
		output.put("boardWidth", BOARD_WIDTH);
		output.put("boardHeight", BOARD_HEIGHT);
		output.put("startX", START_X);
		output.put("startY", START_Y);
		output.put("startFacing", START_FACING.name());
		output.put("targetX", objective.targetX());
		output.put("targetY", objective.targetY());
		output.put("requiresAttack", objective.requiresAttack());
		output.put("parserUsed", useInterpreter);
		output.put("targetReached", context.targetReached());
		output.put("targetHit", context.targetHit());
		output.put("objectiveCompleted", context.objectiveCompleted());
		output.put("resultLabel", context.objectiveCompleted() ? "Mission accomplie" : "Mission incomplete");
		output.put("finalX", context.x());
		output.put("finalY", context.y());
		output.put("finalFacing", context.facing().name());
		output.put("lineCount", config.scriptLines().size());
		output.put("stepCount", steps.size());
		output.put("skippedLineCount", skippedLines.size());
		output.put("scriptLines", config.scriptLines());
		output.put("steps", toStepMaps(steps));
		output.put("treeNodes", treeNodes);
		output.put("skippedLines", skippedLines);

		return new PatternExecutionResult(
			getCode(),
			useInterpreter
				? "Interpreter transforme un mini langage en arbre d expressions executables. Le client manipule alors le langage, pas la logique de chaque commande."
				: "Sans Interpreter, le script est lu ligne par ligne par du code manuel. Les structures du langage comme REPEAT restent alors incomprises et la mission se degrade.",
			logs,
			output,
			buildVisualization(useInterpreter, context, objective)
		);
	}

	private InterpreterConfig toConfig(Map<String, Object> parameters) {
		String mode = toStringValue(parameters.get("mode"), WITH_INTERPRETER).toUpperCase(Locale.ROOT);
		if (!WITH_INTERPRETER.equals(mode) && !WITHOUT_INTERPRETER.equals(mode)) {
			throw new InvalidPatternConfigurationException("Mode Interpreter inconnu : " + mode);
		}

		List<String> scriptLines = toScriptLines(parameters.get("scriptLines"));
		if (scriptLines.isEmpty()) {
			throw new InvalidPatternConfigurationException("Le script Interpreter ne peut pas etre vide.");
		}

		return new InterpreterConfig(
			mode,
			toStringValue(parameters.get("missionName"), "Target Dummy Drill"),
			toStringValue(parameters.get("objective"), "TARGET_DUMMY"),
			scriptLines
		);
	}

	private List<String> toScriptLines(Object rawValue) {
		if (rawValue instanceof List<?> rawList) {
			return rawList.stream()
				.map(value -> value == null ? "" : value.toString().trim())
				.filter(value -> !value.isBlank())
				.toList();
		}

		String rawText = rawValue == null ? "" : rawValue.toString();
		return rawText.lines()
			.map(String::trim)
			.filter(line -> !line.isBlank())
			.toList();
	}

	private String toStringValue(Object value, String defaultValue) {
		String candidate = value == null ? "" : value.toString().trim();
		return candidate.isEmpty() ? defaultValue : candidate;
	}

	private List<ScriptTreeNode> buildTreeNodes(List<ScriptExpression> expressions) {
		List<ScriptTreeNode> nodes = new ArrayList<>();
		nodes.add(new ScriptTreeNode("program", null, "PROGRAM", "PROGRAM", 0, 0, false));
		AtomicInteger sequence = new AtomicInteger(1);

		for (ScriptExpression expression : expressions) {
			expression.flattenTree(nodes, "program", sequence, 1);
		}

		return nodes;
	}

	private int countRepeatExecutions(List<ScriptExpression> expressions) {
		return expressions.stream()
			.mapToInt(this::countRepeatExecutions)
			.sum();
	}

	private int countRepeatExecutions(ScriptExpression expression) {
		if (expression instanceof RepeatExpression repeatExpression) {
			return repeatExpression.repeatCount();
		}
		return 0;
	}

	private ManualExecutionResult executeWithoutInterpreter(List<String> scriptLines, InterpreterContext context) {
		List<InterpreterStep> steps = new ArrayList<>();
		List<ScriptTreeNode> treeNodes = new ArrayList<>();
		List<Map<String, Object>> skippedLines = new ArrayList<>();
		treeNodes.add(new ScriptTreeNode("program", null, "PROGRAM", "PROGRAM", 0, 0, false));
		AtomicInteger sequence = new AtomicInteger(1);

		for (int index = 0; index < scriptLines.size(); index++) {
			String sourceLine = scriptLines.get(index);
			int lineNumber = index + 1;
			String normalized = sourceLine.toUpperCase(Locale.ROOT);
			String nodeId = "node-" + sequence.getAndIncrement();

			if (normalized.matches("^MOVE\\s+\\d+$")) {
				int amount = Integer.parseInt(normalized.replace("MOVE", "").trim());
				treeNodes.add(new ScriptTreeNode(nodeId, "program", sourceLine, "RAW_COMMAND", 1, lineNumber, true));
				new PrimitiveExpression(lineNumber, sourceLine, PrimitiveInstructionType.MOVE, amount).interpret(context, steps);
				continue;
			}

			if ("TURN LEFT".equals(normalized)) {
				treeNodes.add(new ScriptTreeNode(nodeId, "program", sourceLine, "RAW_COMMAND", 1, lineNumber, true));
				new PrimitiveExpression(lineNumber, sourceLine, PrimitiveInstructionType.TURN_LEFT, 1).interpret(context, steps);
				continue;
			}

			if ("TURN RIGHT".equals(normalized)) {
				treeNodes.add(new ScriptTreeNode(nodeId, "program", sourceLine, "RAW_COMMAND", 1, lineNumber, true));
				new PrimitiveExpression(lineNumber, sourceLine, PrimitiveInstructionType.TURN_RIGHT, 1).interpret(context, steps);
				continue;
			}

			if ("ATTACK".equals(normalized)) {
				treeNodes.add(new ScriptTreeNode(nodeId, "program", sourceLine, "RAW_COMMAND", 1, lineNumber, true));
				new PrimitiveExpression(lineNumber, sourceLine, PrimitiveInstructionType.ATTACK, 1).interpret(context, steps);
				continue;
			}

			if ("WAIT".equals(normalized)) {
				treeNodes.add(new ScriptTreeNode(nodeId, "program", sourceLine, "RAW_COMMAND", 1, lineNumber, true));
				new PrimitiveExpression(lineNumber, sourceLine, PrimitiveInstructionType.WAIT, 1).interpret(context, steps);
				continue;
			}

			treeNodes.add(new ScriptTreeNode(nodeId, "program", sourceLine, "UNSUPPORTED", 1, lineNumber, false));
			skippedLines.add(Map.of(
				"lineNumber", lineNumber,
				"sourceLine", sourceLine,
				"reason", normalized.startsWith("REPEAT") || "}".equals(normalized)
					? "Structure de langage non comprise sans Interpreter"
					: "Instruction ignoree par le lecteur manuel"
			));
		}

		return new ManualExecutionResult(steps, treeNodes, skippedLines);
	}

	private List<Map<String, Object>> toStepMaps(List<InterpreterStep> steps) {
		List<Map<String, Object>> mappedSteps = new ArrayList<>();
		for (int index = 0; index < steps.size(); index++) {
			InterpreterStep step = steps.get(index);
			LinkedHashMap<String, Object> stepMap = new LinkedHashMap<>();
			stepMap.put("index", index + 1);
			stepMap.put("lineNumber", step.lineNumber());
			stepMap.put("sourceLine", step.sourceLine());
			stepMap.put("actionCode", step.actionCode());
			stepMap.put("detail", step.detail());
			stepMap.put("x", step.x());
			stepMap.put("y", step.y());
			stepMap.put("facing", step.facing());
			stepMap.put("targetReached", step.targetReached());
			stepMap.put("targetHit", step.targetHit());
			stepMap.put("objectiveCompleted", step.objectiveCompleted());
			mappedSteps.add(stepMap);
		}
		return mappedSteps;
	}

	private VisualizationGraph buildVisualization(boolean useInterpreter, InterpreterContext context, InterpreterObjective objective) {
		List<VisualizationNode> nodes = new ArrayList<>();
		List<VisualizationEdge> edges = new ArrayList<>();

		nodes.add(new VisualizationNode("client", "Code your logic", "client", Map.of("detail", "script author")));
		nodes.add(new VisualizationNode(
			useInterpreter ? "parser" : "manual",
			useInterpreter ? "Interpreter" : "Manual Runner",
			useInterpreter ? "context" : "component",
			Map.of("detail", useInterpreter ? "parse + ast" : "if / else lineaire")
		));
		if (useInterpreter) {
			nodes.add(new VisualizationNode("ast", "AST", "cluster", Map.of("detail", "repeat + commands")));
			edges.add(new VisualizationEdge("client", "parser", "parse"));
			edges.add(new VisualizationEdge("parser", "ast", "build"));
			edges.add(new VisualizationEdge("ast", "arena", "execute"));
		} else {
			edges.add(new VisualizationEdge("client", "manual", "scan"));
			edges.add(new VisualizationEdge("manual", "arena", "execute"));
		}

		nodes.add(new VisualizationNode(
			"arena",
			"Mission Context",
			"state",
			Map.of("detail", context.facing().label() + " @ (" + context.x() + "," + context.y() + ")")
		));
		nodes.add(new VisualizationNode(
			"objective",
			objective.targetLabel(),
			"output",
			Map.of("detail", objective.label(), "active", context.objectiveCompleted())
		));
		nodes.add(new VisualizationNode(
			"result",
			context.objectiveCompleted() ? "Success" : "Blocked",
			"output",
			Map.of("message", context.objectiveCompleted() ? "goal reached" : "script incomplete")
		));
		edges.add(new VisualizationEdge(useInterpreter ? "arena" : "arena", "objective", "reach"));
		edges.add(new VisualizationEdge("objective", "result", context.objectiveCompleted() ? "validated" : "pending"));

		if (!useInterpreter) {
			edges.add(new VisualizationEdge("manual", "result", "skips repeat"));
		}

		return new VisualizationGraph(nodes, edges);
	}

	private record ManualExecutionResult(
		List<InterpreterStep> steps,
		List<ScriptTreeNode> treeNodes,
		List<Map<String, Object>> skippedLines
	) {
	}
}
