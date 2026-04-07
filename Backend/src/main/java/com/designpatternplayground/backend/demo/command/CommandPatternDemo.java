package com.designpatternplayground.backend.demo.command;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Component;

import com.designpatternplayground.backend.common.exception.InvalidPatternConfigurationException;
import com.designpatternplayground.backend.demo.command.domain.AddBeaconCommand;
import com.designpatternplayground.backend.demo.command.domain.BoardCommand;
import com.designpatternplayground.backend.demo.command.domain.CommandAction;
import com.designpatternplayground.backend.demo.command.domain.CommandBoard;
import com.designpatternplayground.backend.demo.command.domain.CommandInvoker;
import com.designpatternplayground.backend.demo.command.domain.CommandStackEntry;
import com.designpatternplayground.backend.demo.command.domain.CommandStep;
import com.designpatternplayground.backend.demo.command.domain.DeleteBeaconCommand;
import com.designpatternplayground.backend.demo.command.domain.MoveLeftCommand;
import com.designpatternplayground.backend.demo.command.domain.MoveRightCommand;
import com.designpatternplayground.backend.demo.command.domain.MoveUpCommand;
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
public class CommandPatternDemo implements DesignPatternDemo {

	private static final String WITH_COMMAND = "WITH_COMMAND";
	private static final String WITHOUT_COMMAND = "WITHOUT_COMMAND";
	private static final List<String> AVAILABLE_ACTIONS = List.of(
		"ADD_BEACON",
		"MOVE_RIGHT",
		"MOVE_UP",
		"MOVE_LEFT",
		"DELETE_BEACON",
		"UNDO",
		"REDO"
	);

	@Override
	public String getCode() {
		return "command";
	}

	@Override
	public PatternMetadata getMetadata() {
		return new PatternMetadata(
			"command",
			"Command",
			PatternType.BEHAVIORAL,
			"Encapsule une action dans un objet pour la declencher, la historiser et la rejouer sans coupler l interface au receiver.",
			"Construire un simulateur undo / redo avec historique de commandes, piles de controle et receiver isole.",
			"INTERMEDIATE"
		);
	}

	@Override
	public PatternSchema getSchema() {
		return new PatternSchema(List.of(
			new PatternField("mode", "Mode", FieldType.SELECT, true, List.of(WITH_COMMAND, WITHOUT_COMMAND), WITH_COMMAND),
			new PatternField("boardName", "Nom de la grille", FieldType.TEXT, true, null, "Arena Grid"),
			new PatternField("actorName", "Nom de l agent", FieldType.TEXT, true, null, "Pixel Bot"),
			new PatternField(
				"actions",
				"Sequence d actions",
				FieldType.LIST,
				true,
				AVAILABLE_ACTIONS,
				"ADD_BEACON, MOVE_RIGHT, MOVE_UP, UNDO, REDO, DELETE_BEACON"
			)
		));
	}

	@Override
	public PatternExecutionResult execute(PatternExecutionRequest request) {
		CommandConfig config = toConfig(request.parameters());
		boolean useCommand = WITH_COMMAND.equals(config.mode());
		CommandBoard board = new CommandBoard(config.boardName(), config.actorName());
		List<String> logs = new ArrayList<>();
		List<CommandStep> history;
		List<CommandStackEntry> undoStack;
		List<CommandStackEntry> redoStack;

		if (useCommand) {
			CommandInvoker invoker = new CommandInvoker(board);
			logs.add("Creation du receiver " + board.boardName() + " pour " + board.actorName() + ".");
			logs.add("Initialisation du CommandInvoker avec deux piles : undo et redo.");

			history = new ArrayList<>();
			for (int index = 0; index < config.actions().size(); index += 1) {
				CommandAction action = CommandAction.fromCode(config.actions().get(index));
				CommandStep step = switch (action) {
					case UNDO -> invoker.undo(index + 1);
					case REDO -> invoker.redo(index + 1);
					default -> invoker.execute(createCommand(action), index + 1);
				};

				logs.add("Action " + step.index() + " - " + step.actionCode() + " : " + step.detail());
				history.add(step);
			}

			undoStack = invoker.undoStackEntries();
			redoStack = invoker.redoStackEntries();
		} else {
			logs.add("Mode sans Command : le controleur modifie directement le receiver.");
			logs.add("Aucune pile de commandes n est maintenue, donc undo et redo ne peuvent pas fonctionner.");
			history = executeWithoutCommand(board, config.actions(), logs);
			undoStack = List.of();
			redoStack = List.of();
		}

		int blockedCommands = (int) history.stream().filter(step -> !step.accepted()).count();
		int controlCommands = (int) history.stream()
			.filter(step -> "UNDO".equals(step.actionCode()) || "REDO".equals(step.actionCode()))
			.filter(CommandStep::accepted)
			.count();
		List<String> visitedCells = history.stream()
			.map(step -> step.positionX() + "," + step.positionY())
			.collect(java.util.stream.Collectors.collectingAndThen(
				java.util.stream.Collectors.toCollection(LinkedHashSet::new),
				ArrayList::new
			));

		LinkedHashMap<String, Object> output = new LinkedHashMap<>();
		output.put("mode", useCommand ? WITH_COMMAND : WITHOUT_COMMAND);
		output.put("modeLabel", useCommand ? "Avec Command" : "Sans Command");
		output.put("boardName", board.boardName());
		output.put("actorName", board.actorName());
		output.put("boardSize", board.gridSize());
		output.put("positionX", board.x());
		output.put("positionY", board.y());
		output.put("beaconCount", board.beaconCount());
		output.put("actionCount", config.actions().size());
		output.put("executedCommands", (int) history.stream().filter(CommandStep::accepted).count());
		output.put("blockedCommands", blockedCommands);
		output.put("successfulControlCommands", controlCommands);
		output.put("undoStack", undoStack);
		output.put("redoStack", redoStack);
		output.put("visitedCells", visitedCells);
		output.put("history", history.stream().map(this::toHistoryMap).toList());

		return new PatternExecutionResult(
			getCode(),
			useCommand
				? "Command encapsule chaque action dans un objet autonome. L invoker peut donc conserver un historique, annuler et rejouer des operations."
				: "Sans Command, l interface appelle directement le receiver. Les actions partent, mais aucune pile n existe pour les annuler proprement.",
			logs,
			output,
			buildVisualization(useCommand, board, undoStack, redoStack)
		);
	}

	private List<CommandStep> executeWithoutCommand(
		CommandBoard board,
		List<String> rawActions,
		List<String> logs
	) {
		List<CommandStep> history = new ArrayList<>();

		for (int index = 0; index < rawActions.size(); index += 1) {
			CommandAction action = CommandAction.fromCode(rawActions.get(index));

			if (action.controlAction()) {
				CommandStep step = new CommandStep(
					index + 1,
					action.code(),
					action.label(),
					"BLOCKED",
					false,
					"Le controleur direct ne stocke aucune commande : " + action.label().toLowerCase() + " est impossible.",
					board.x(),
					board.y(),
					board.beaconCount(),
					0,
					0,
					List.of(),
					List.of()
				);
				logs.add("Action " + step.index() + " - " + step.actionCode() + " : " + step.detail());
				history.add(step);
				continue;
			}

			applyDirect(board, action);
			CommandStep step = new CommandStep(
				index + 1,
				action.code(),
				action.label(),
				"DIRECT",
				true,
				directDetail(board, action),
				board.x(),
				board.y(),
				board.beaconCount(),
				0,
				0,
				List.of(),
				List.of()
			);
			logs.add("Action " + step.index() + " - " + step.actionCode() + " : " + step.detail());
			history.add(step);
		}

		return List.copyOf(history);
	}

	private VisualizationGraph buildVisualization(
		boolean useCommand,
		CommandBoard board,
		List<CommandStackEntry> undoStack,
		List<CommandStackEntry> redoStack
	) {
		List<VisualizationNode> nodes = List.of(
			new VisualizationNode(
				"controller",
				useCommand ? "CommandInvoker" : "DirectController",
				"context",
				Map.of("detail", useCommand ? "dispatch + history" : "mutations directes")
			),
			new VisualizationNode(
				"command",
				useCommand ? "BoardCommand" : "Inline actions",
				"cluster",
				Map.of("detail", useCommand ? "actions encapsulees" : "aucun objet commande")
			),
			new VisualizationNode(
				"receiver",
				"ArenaBoard",
				"component",
				Map.of("detail", board.actorName() + " sur " + board.boardName())
			),
			new VisualizationNode(
				"undo",
				"Undo stack",
				"decorator",
				Map.of("detail", undoStack.size() + " commande(s)")
			),
			new VisualizationNode(
				"redo",
				"Redo stack",
				"decorator",
				Map.of("detail", redoStack.size() + " commande(s)")
			),
			new VisualizationNode(
				"result",
				"Etat final",
				"output",
				Map.of("message", "x=" + board.x() + " y=" + board.y() + " balises=" + board.beaconCount())
			)
		);

		List<VisualizationEdge> edges = new ArrayList<>();
		edges.add(new VisualizationEdge("controller", "command", useCommand ? "dispatch" : "inline"));
		edges.add(new VisualizationEdge("command", "receiver", useCommand ? "execute" : "mutate"));
		edges.add(new VisualizationEdge("receiver", "result", "state"));
		edges.add(new VisualizationEdge("controller", "undo", useCommand ? "push/pop" : "empty"));
		edges.add(new VisualizationEdge("controller", "redo", useCommand ? "redo" : "empty"));

		return new VisualizationGraph(nodes, edges);
	}

	private Map<String, Object> toHistoryMap(CommandStep step) {
		LinkedHashMap<String, Object> map = new LinkedHashMap<>();
		map.put("index", step.index());
		map.put("actionCode", step.actionCode());
		map.put("actionLabel", step.actionLabel());
		map.put("operationType", step.operationType());
		map.put("accepted", step.accepted());
		map.put("detail", step.detail());
		map.put("positionX", step.positionX());
		map.put("positionY", step.positionY());
		map.put("beaconCount", step.beaconCount());
		map.put("undoDepth", step.undoDepth());
		map.put("redoDepth", step.redoDepth());
		map.put("undoStack", step.undoStack().stream().map(this::toStackMap).toList());
		map.put("redoStack", step.redoStack().stream().map(this::toStackMap).toList());
		return map;
	}

	private Map<String, Object> toStackMap(CommandStackEntry entry) {
		return Map.of(
			"actionCode", entry.actionCode(),
			"actionLabel", entry.actionLabel(),
			"commandClass", entry.commandClass()
		);
	}

	private BoardCommand createCommand(CommandAction action) {
		return switch (action) {
			case ADD_BEACON -> new AddBeaconCommand();
			case MOVE_RIGHT -> new MoveRightCommand();
			case MOVE_UP -> new MoveUpCommand();
			case MOVE_LEFT -> new MoveLeftCommand();
			case DELETE_BEACON -> new DeleteBeaconCommand();
			case UNDO, REDO -> throw new InvalidPatternConfigurationException("UNDO et REDO ne creent pas de commande concrete.");
		};
	}

	private void applyDirect(CommandBoard board, CommandAction action) {
		switch (action) {
			case ADD_BEACON -> board.addBeacon();
			case MOVE_RIGHT -> board.moveRight();
			case MOVE_UP -> board.moveUp();
			case MOVE_LEFT -> board.moveLeft();
			case DELETE_BEACON -> board.deleteBeacon();
			case UNDO, REDO -> throw new InvalidPatternConfigurationException("Action de controle non supportee en direct : " + action.code());
		}
	}

	private String directDetail(CommandBoard board, CommandAction action) {
		return switch (action) {
			case ADD_BEACON -> board.actorName() + " ajoute directement une balise sans objet commande intermediaire.";
			case MOVE_RIGHT -> board.actorName() + " est deplace a droite par le controleur direct.";
			case MOVE_UP -> board.actorName() + " est deplace vers le haut par le controleur direct.";
			case MOVE_LEFT -> board.actorName() + " est deplace a gauche par le controleur direct.";
			case DELETE_BEACON -> board.actorName() + " supprime une balise par appel direct.";
			case UNDO, REDO -> "Action de controle non disponible.";
		};
	}

	private CommandConfig toConfig(Map<String, Object> parameters) {
		if (parameters == null) {
			throw new InvalidPatternConfigurationException("Les parametres sont obligatoires.");
		}

		String mode = normalizeMode(parameters.get("mode"));
		String boardName = normalizeRequiredText(parameters.get("boardName"), "Le nom de la grille est obligatoire.");
		String actorName = normalizeRequiredText(parameters.get("actorName"), "Le nom de l agent est obligatoire.");
		List<String> actions = normalizeActions(parameters.get("actions"));

		if (actions.isEmpty()) {
			throw new InvalidPatternConfigurationException("Au moins une action est obligatoire.");
		}

		return new CommandConfig(mode, boardName, actorName, actions);
	}

	private String normalizeMode(Object rawValue) {
		String mode = rawValue == null ? WITH_COMMAND : rawValue.toString().trim().toUpperCase();
		if (!WITH_COMMAND.equals(mode) && !WITHOUT_COMMAND.equals(mode)) {
			throw new InvalidPatternConfigurationException("Mode Command inconnu : " + rawValue);
		}
		return mode;
	}

	private String normalizeRequiredText(Object rawValue, String message) {
		if (rawValue == null || rawValue.toString().isBlank()) {
			throw new InvalidPatternConfigurationException(message);
		}
		return rawValue.toString().trim();
	}

	private List<String> normalizeActions(Object rawValue) {
		List<String> rawActions;

		if (rawValue instanceof List<?> values) {
			rawActions = values.stream().map(String::valueOf).toList();
		} else {
			rawActions = List.of(String.valueOf(rawValue == null ? "" : rawValue).split(","));
		}

		return rawActions.stream()
			.map(String::trim)
			.filter(value -> !value.isBlank())
			.map(value -> CommandAction.fromCode(value).code())
			.toList();
	}
}
