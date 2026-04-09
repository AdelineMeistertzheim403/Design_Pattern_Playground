package com.designpatternplayground.backend.demo.visitor.domain;

import java.util.LinkedHashMap;
import java.util.List;

public final class CountElementsVisitor implements StructureVisitor {

	private int folderCount;
	private int fileCount;

	@Override
	public String code() {
		return "COUNT_ELEMENTS";
	}

	@Override
	public String label() {
		return "Count Elements";
	}

	@Override
	public String description() {
		return "Compte tous les dossiers et fichiers sans toucher aux classes de la structure.";
	}

	@Override
	public VisitFeedback visitFolder(WorkspaceFolder folder) {
		folderCount++;
		return new VisitFeedback(false, "Dossier compte dans le total.");
	}

	@Override
	public VisitFeedback visitFile(WorkspaceFile file) {
		fileCount++;
		return new VisitFeedback(false, "Fichier ajoute au total.");
	}

	@Override
	public boolean shouldStop() {
		return false;
	}

	@Override
	public List<String> matchedIds() {
		return List.of();
	}

	@Override
	public LinkedHashMap<String, Object> buildResultFields() {
		LinkedHashMap<String, Object> fields = new LinkedHashMap<>();
		fields.put("folderCount", folderCount);
		fields.put("fileCount", fileCount);
		fields.put("resultLabel", (folderCount + fileCount) + " elements");
		fields.put("resultDetail", folderCount + " dossiers analyses et " + fileCount + " fichiers comptes.");
		return fields;
	}
}
