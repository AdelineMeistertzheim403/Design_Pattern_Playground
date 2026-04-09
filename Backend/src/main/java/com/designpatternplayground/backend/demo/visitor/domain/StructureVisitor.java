package com.designpatternplayground.backend.demo.visitor.domain;

import java.util.LinkedHashMap;
import java.util.List;

public interface StructureVisitor {

	String code();

	String label();

	String description();

	VisitFeedback visitFolder(WorkspaceFolder folder);

	VisitFeedback visitFile(WorkspaceFile file);

	boolean shouldStop();

	List<String> matchedIds();

	LinkedHashMap<String, Object> buildResultFields();
}
