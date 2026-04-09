package com.designpatternplayground.backend.demo.interpreter.domain;

import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

public record RepeatExpression(
	int lineNumber,
	String sourceLine,
	int repeatCount,
	List<ScriptExpression> children
) implements ScriptExpression {

	@Override
	public void interpret(InterpreterContext context, List<InterpreterStep> steps) {
		for (int iteration = 0; iteration < repeatCount; iteration++) {
			for (ScriptExpression child : children) {
				child.interpret(context, steps);
			}
		}
	}

	@Override
	public void flattenTree(List<ScriptTreeNode> nodes, String parentId, AtomicInteger sequence, int depth) {
		String nodeId = "node-" + sequence.getAndIncrement();
		nodes.add(new ScriptTreeNode(
			nodeId,
			parentId,
			sourceLine,
			"BLOCK",
			depth,
			lineNumber,
			false
		));

		for (ScriptExpression child : children) {
			child.flattenTree(nodes, nodeId, sequence, depth + 1);
		}
	}
}
