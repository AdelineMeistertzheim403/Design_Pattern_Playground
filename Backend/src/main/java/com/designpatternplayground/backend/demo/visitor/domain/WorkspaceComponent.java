package com.designpatternplayground.backend.demo.visitor.domain;

import java.util.List;
import java.util.Set;

public interface WorkspaceComponent {

	String id();

	String label();

	String kind();

	int sizeMb();

	boolean infected();

	List<WorkspaceComponent> children();

	void accept(StructureVisitor visitor, List<VisitorTraversalStep> steps, int depth);

	void flatten(List<VisitorTreeNode> nodes, String parentId, int depth, Set<String> visitedIds, Set<String> matchedIds);
}
