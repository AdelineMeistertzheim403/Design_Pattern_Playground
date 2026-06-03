package com.designpatternplayground.backend.demo.visitor.domain;

import java.util.Locale;

import com.designpatternplayground.backend.common.exception.InvalidPatternConfigurationException;

public enum VisitorAnalysisType {

	COUNT_ELEMENTS("COUNT_ELEMENTS", "Count Elements", "Compte tous les éléments de la structure."),
	CALCULATE_VALUE("CALCULATE_VALUE", "Calculate Value", "Additionne la taille totale des fichiers."),
	FIND_ELEMENT("FIND_ELEMENT", "Find Element", "Recherche un élément cible dans l'arbre."),
	VIRUS_SCAN("VIRUS_SCAN", "Virus Scan", "Detecte les fichiers marques comme infectes.");

	private final String code;
	private final String label;
	private final String description;

	VisitorAnalysisType(String code, String label, String description) {
		this.code = code;
		this.label = label;
		this.description = description;
	}

	public String code() {
		return code;
	}

	public String label() {
		return label;
	}

	public String description() {
		return description;
	}

	public StructureVisitor buildVisitor(String searchTerm) {
		return switch (this) {
			case COUNT_ELEMENTS -> new CountElementsVisitor();
			case CALCULATE_VALUE -> new CalculateValueVisitor();
			case FIND_ELEMENT -> new FindElementVisitor(searchTerm);
			case VIRUS_SCAN -> new VirusScannerVisitor();
		};
	}

	public static VisitorAnalysisType fromCode(String code) {
		for (VisitorAnalysisType value : values()) {
			if (value.code.equals(code == null ? "" : code.trim().toUpperCase(Locale.ROOT))) {
				return value;
			}
		}
		throw new InvalidPatternConfigurationException("Visitor inconnu : " + code);
	}
}
