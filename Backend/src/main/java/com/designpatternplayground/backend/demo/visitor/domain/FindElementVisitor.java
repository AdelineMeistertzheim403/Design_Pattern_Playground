package com.designpatternplayground.backend.demo.visitor.domain;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;

public final class FindElementVisitor implements StructureVisitor {

	private final String searchTerm;
	private String foundId;
	private String foundLabel;

	public FindElementVisitor(String searchTerm) {
		this.searchTerm = searchTerm == null ? "" : searchTerm.trim().toLowerCase(Locale.ROOT);
	}

	@Override
	public String code() {
		return "FIND_ELEMENT";
	}

	@Override
	public String label() {
		return "Find Élément";
	}

	@Override
	public String description() {
		return "Recherche un élément cible dans l arbre et peut stopper le parcours dès qu'il est trouve.";
	}

	@Override
	public VisitFeedback visitFolder(WorkspaceFolder folder) {
		boolean matched = matches(folder.label());
		if (matched && foundId == null) {
			foundId = folder.id();
			foundLabel = folder.label();
		}
		return new VisitFeedback(matched, matched ? "Cible trouvee dans un dossier." : "Dossier inspecte.");
	}

	@Override
	public VisitFeedback visitFile(WorkspaceFile file) {
		boolean matched = matches(file.label());
		if (matched && foundId == null) {
			foundId = file.id();
			foundLabel = file.label();
		}
		return new VisitFeedback(matched, matched ? "Élément recherche trouve." : "Fichier compare au terme de recherche.");
	}

	@Override
	public boolean shouldStop() {
		return foundId != null;
	}

	@Override
	public List<String> matchedIds() {
		return foundId == null ? List.of() : List.of(foundId);
	}

	@Override
	public LinkedHashMap<String, Object> buildResultFields() {
		LinkedHashMap<String, Object> fields = new LinkedHashMap<>();
		fields.put("found", foundId != null);
		fields.put("foundLabel", foundLabel == null ? "" : foundLabel);
		fields.put("resultLabel", foundId == null ? "Introuvable" : "Trouve");
		fields.put(
			"resultDetail",
			foundId == null
				? "Aucun élément ne correspond a \"" + searchTerm + "\"."
				: "Élément trouve : " + foundLabel + "."
		);
		return fields;
	}

	private boolean matches(String label) {
		return !searchTerm.isBlank() && label.toLowerCase(Locale.ROOT).contains(searchTerm);
	}
}
