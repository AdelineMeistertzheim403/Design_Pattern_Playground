package com.designpatternplayground.backend.demo.visitor.domain;

import java.util.LinkedHashMap;
import java.util.List;

public final class CalculateValueVisitor implements StructureVisitor {

	private int totalSizeMb;
	private int pricedFiles;

	@Override
	public String code() {
		return "CALCULATE_VALUE";
	}

	@Override
	public String label() {
		return "Calculate Value";
	}

	@Override
	public String description() {
		return "Additionne la valeur des fichiers sans modifier les classes de dossier et de fichier.";
	}

	@Override
	public VisitFeedback visitFolder(WorkspaceFolder folder) {
		return new VisitFeedback(false, "Ouverture du dossier pour additionner les fichiers.");
	}

	@Override
	public VisitFeedback visitFile(WorkspaceFile file) {
		totalSizeMb += file.sizeMb();
		pricedFiles++;
		return new VisitFeedback(false, file.sizeMb() + " MB ajoutes à la valeur totale.");
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
		fields.put("pricedFileCount", pricedFiles);
		fields.put("totalValueMb", totalSizeMb);
		fields.put("resultLabel", totalSizeMb + " MB");
		fields.put("resultDetail", "Valeur totale calculee sur " + pricedFiles + " fichiers.");
		return fields;
	}
}
