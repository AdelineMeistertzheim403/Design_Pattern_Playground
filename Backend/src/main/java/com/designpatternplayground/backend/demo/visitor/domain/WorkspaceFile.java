package com.designpatternplayground.backend.demo.visitor.domain;

import java.util.List;
import java.util.Set;

public record WorkspaceFile(
	String id,
	String label,
	int sizeMb,
	boolean infected
) implements WorkspaceComponent {

	@Override
	public String kind() {
		return "FILE";
	}

	@Override
	public List<WorkspaceComponent> children() {
		return List.of();
	}

	@Override
	public void accept(StructureVisitor visitor, List<VisitorTraversalStep> steps, int depth) {
		VisitFeedback feedback = visitor.visitFile(this);
		steps.add(new VisitorTraversalStep(id, label, kind(), depth, feedback.detail(), feedback.matched()));
	}

	@Override
	public void flatten(List<VisitorTreeNode> nodes, String parentId, int depth, Set<String> visitedIds, Set<String> matchedIds) {
		nodes.add(new VisitorTreeNode(
			id,
			parentId,
			label,
			kind(),
			depth,
			sizeMb,
			infected,
			visitedIds.contains(id),
			matchedIds.contains(id)
		));
	}
}
