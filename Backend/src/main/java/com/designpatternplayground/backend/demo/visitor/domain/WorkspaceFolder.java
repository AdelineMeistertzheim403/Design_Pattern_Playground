package com.designpatternplayground.backend.demo.visitor.domain;

import java.util.List;
import java.util.Set;

public record WorkspaceFolder(
	String id,
	String label,
	List<WorkspaceComponent> children
) implements WorkspaceComponent {

	@Override
	public String kind() {
		return "FOLDER";
	}

	@Override
	public int sizeMb() {
		return 0;
	}

	@Override
	public boolean infected() {
		return false;
	}

	@Override
	public void accept(StructureVisitor visitor, List<VisitorTraversalStep> steps, int depth) {
		VisitFeedback feedback = visitor.visitFolder(this);
		steps.add(new VisitorTraversalStep(id, label, kind(), depth, feedback.detail(), feedback.matched()));

		if (visitor.shouldStop()) {
			return;
		}

		for (WorkspaceComponent child : children) {
			child.accept(visitor, steps, depth + 1);
			if (visitor.shouldStop()) {
				break;
			}
		}
	}

	@Override
	public void flatten(List<VisitorTreeNode> nodes, String parentId, int depth, Set<String> visitedIds, Set<String> matchedIds) {
		nodes.add(new VisitorTreeNode(
			id,
			parentId,
			label,
			kind(),
			depth,
			0,
			false,
			visitedIds.contains(id),
			matchedIds.contains(id)
		));

		for (WorkspaceComponent child : children) {
			child.flatten(nodes, id, depth + 1, visitedIds, matchedIds);
		}
	}
}
