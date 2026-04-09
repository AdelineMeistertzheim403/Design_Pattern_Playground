package com.designpatternplayground.backend.demo.visitor.domain;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;

public final class VirusScannerVisitor implements StructureVisitor {

	private final List<String> infectedIds = new ArrayList<>();
	private int infectedCount;

	@Override
	public String code() {
		return "VIRUS_SCAN";
	}

	@Override
	public String label() {
		return "Virus Scan";
	}

	@Override
	public String description() {
		return "Parcourt tous les fichiers pour detecter les artefacts marques comme infectes.";
	}

	@Override
	public VisitFeedback visitFolder(WorkspaceFolder folder) {
		return new VisitFeedback(false, "Scan du dossier en cours.");
	}

	@Override
	public VisitFeedback visitFile(WorkspaceFile file) {
		if (file.infected()) {
			infectedCount++;
			infectedIds.add(file.id());
			return new VisitFeedback(true, "Menace detectee dans ce fichier.");
		}
		return new VisitFeedback(false, "Fichier sain.");
	}

	@Override
	public boolean shouldStop() {
		return false;
	}

	@Override
	public List<String> matchedIds() {
		return List.copyOf(infectedIds);
	}

	@Override
	public LinkedHashMap<String, Object> buildResultFields() {
		LinkedHashMap<String, Object> fields = new LinkedHashMap<>();
		fields.put("infectedCount", infectedCount);
		fields.put("resultLabel", infectedCount == 0 ? "Aucune menace" : infectedCount + " menace(s)");
		fields.put(
			"resultDetail",
			infectedCount == 0
				? "Le visitor n a trouve aucun fichier infecte."
				: infectedCount + " fichier(s) infecte(s) detecte(s)."
		);
		return fields;
	}
}
