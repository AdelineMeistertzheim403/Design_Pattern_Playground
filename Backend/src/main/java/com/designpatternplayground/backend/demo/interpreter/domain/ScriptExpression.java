package com.designpatternplayground.backend.demo.interpreter.domain;

import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

public interface ScriptExpression {

	void interpret(InterpreterContext context, List<InterpreterStep> steps);

	void flattenTree(List<ScriptTreeNode> nodes, String parentId, AtomicInteger sequence, int depth);
}
