package com.designpatternplayground.backend.demo.interpreter.domain;

import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

public record PrimitiveExpression(
	int lineNumber,
	String sourceLine,
	PrimitiveInstructionType type,
	int amount
) implements ScriptExpression {

	@Override
	public void interpret(InterpreterContext context, List<InterpreterStep> steps) {
		switch (type) {
			case MOVE -> interpretMove(context, steps);
			case TURN_LEFT -> {
				context.turnLeft();
				steps.add(new InterpreterStep(
					lineNumber,
					sourceLine,
					"TURN_LEFT",
					"Rotation vers la gauche.",
					context.x(),
					context.y(),
					context.facing().name(),
					context.targetReached(),
					context.targetHit(),
					context.objectiveCompleted()
				));
			}
			case TURN_RIGHT -> {
				context.turnRight();
				steps.add(new InterpreterStep(
					lineNumber,
					sourceLine,
					"TURN_RIGHT",
					"Rotation vers la droite.",
					context.x(),
					context.y(),
					context.facing().name(),
					context.targetReached(),
					context.targetHit(),
					context.objectiveCompleted()
				));
			}
			case ATTACK -> {
				context.attack();
				steps.add(new InterpreterStep(
					lineNumber,
					sourceLine,
					"ATTACK",
					context.targetHit() ? "Attaque validee sur la cible." : "Attaque lancee hors de la cible.",
					context.x(),
					context.y(),
					context.facing().name(),
					context.targetReached(),
					context.targetHit(),
					context.objectiveCompleted()
				));
			}
			case WAIT -> steps.add(new InterpreterStep(
				lineNumber,
				sourceLine,
				"WAIT",
				"Pause tactique sans mouvement.",
				context.x(),
				context.y(),
				context.facing().name(),
				context.targetReached(),
				context.targetHit(),
				context.objectiveCompleted()
			));
		}
	}

	@Override
	public void flattenTree(List<ScriptTreeNode> nodes, String parentId, AtomicInteger sequence, int depth) {
		nodes.add(new ScriptTreeNode(
			"node-" + sequence.getAndIncrement(),
			parentId,
			sourceLine,
			"COMMAND",
			depth,
			lineNumber,
			true
		));
	}

	private void interpretMove(InterpreterContext context, List<InterpreterStep> steps) {
		for (int index = 1; index <= amount; index++) {
			boolean moved = context.moveOne();
			steps.add(new InterpreterStep(
				lineNumber,
				sourceLine,
				"MOVE",
				moved
					? "Avance " + index + " / " + amount + "."
					: "Bloque par le bord sur " + index + " / " + amount + ".",
				context.x(),
				context.y(),
				context.facing().name(),
				context.targetReached(),
				context.targetHit(),
				context.objectiveCompleted()
			));
		}
	}
}
