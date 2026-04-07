package com.designpatternplayground.backend.demo.command.domain;

import java.util.ArrayDeque;
import java.util.Deque;
import java.util.List;

public class CommandInvoker {

	private final CommandBoard board;
	private final Deque<BoardCommand> undoStack = new ArrayDeque<>();
	private final Deque<BoardCommand> redoStack = new ArrayDeque<>();

	public CommandInvoker(CommandBoard board) {
		this.board = board;
	}

	public CommandStep execute(BoardCommand command, int index) {
		command.execute(board);
		undoStack.push(command);
		redoStack.clear();

		return snapshot(
			index,
			command.action(),
			"EXECUTE",
			true,
			executeDetail(command.action())
		);
	}

	public CommandStep undo(int index) {
		if (undoStack.isEmpty()) {
			return snapshot(
				index,
				CommandAction.UNDO,
				"UNDO",
				false,
				"Aucune commande a annuler : la pile undo est vide."
			);
		}

		BoardCommand command = undoStack.pop();
		command.undo(board);
		redoStack.push(command);

		return snapshot(
			index,
			CommandAction.UNDO,
			"UNDO",
			true,
			"Undo retire " + command.action().label().toLowerCase() + " de la pile active et restaure l etat precedent."
		);
	}

	public CommandStep redo(int index) {
		if (redoStack.isEmpty()) {
			return snapshot(
				index,
				CommandAction.REDO,
				"REDO",
				false,
				"Aucune commande a rejouer : la pile redo est vide."
			);
		}

		BoardCommand command = redoStack.pop();
		command.execute(board);
		undoStack.push(command);

		return snapshot(
			index,
			CommandAction.REDO,
			"REDO",
			true,
			"Redo rejoue " + command.action().label().toLowerCase() + " depuis la pile redo."
		);
	}

	public List<CommandStackEntry> undoStackEntries() {
		return undoStack.stream().map(this::toEntry).toList();
	}

	public List<CommandStackEntry> redoStackEntries() {
		return redoStack.stream().map(this::toEntry).toList();
	}

	private CommandStep snapshot(
		int index,
		CommandAction action,
		String operationType,
		boolean accepted,
		String detail
	) {
		return new CommandStep(
			index,
			action.code(),
			action.label(),
			operationType,
			accepted,
			detail,
			board.x(),
			board.y(),
			board.beaconCount(),
			undoStack.size(),
			redoStack.size(),
			undoStackEntries(),
			redoStackEntries()
		);
	}

	private CommandStackEntry toEntry(BoardCommand command) {
		return new CommandStackEntry(
			command.action().code(),
			command.action().label(),
			command.label()
		);
	}

	private String executeDetail(CommandAction action) {
		return switch (action) {
			case ADD_BEACON -> board.actorName() + " depose une balise sur la grille.";
			case MOVE_RIGHT -> board.actorName() + " avance d une case vers la droite.";
			case MOVE_UP -> board.actorName() + " monte d une case.";
			case MOVE_LEFT -> board.actorName() + " recule d une case vers la gauche.";
			case DELETE_BEACON -> board.actorName() + " retire une balise active.";
			case UNDO, REDO -> "Action de controle.";
		};
	}
}
