package com.designpatternplayground.backend.demo.template.domain;

import java.util.Arrays;

import com.designpatternplayground.backend.common.exception.InvalidPatternConfigurationException;

public enum TemplateWorkflowProfile {

	RELEASE_PIPELINE(
		"RELEASE_PIPELINE",
		"Release Pipeline",
		"Publie une version avec preparation commune, deploiement spécialisé et cloture stable.",
		"Preparation environnement",
		"Verifie les pre-requis, givre la version et reserve la fenetre de livraison.",
		"Deploiement progressif",
		"Diffuse la release par vagues sur les environnements cibles en surveillant la sante du service.",
		"Cloture diffusion",
		"Publie les notes de version, ferme la war room et reactive les alertes normales.",
		"Sans squelette commun, le deploiement se termine souvent sans cloture propre : notes oubliees et monitoring laisse en mode incident.",
		"Release stabilisee",
		"pipeline delivery"
	),
	SECURITY_AUDIT(
		"SECURITY_AUDIT",
		"Security Audit",
		"Deroule un audit avec preparation commune, scan spécialisé et finalisation tracee.",
		"Preparation audit",
		"Charge les signatures, verrouille la fenetre de scan et rassemble la liste des endpoints critiques.",
		"Scan de sécurité",
		"Analyse les surfaces critiques, compare les signatures et remonte les ecarts prioritaires.",
		"Cloture audit",
		"Archive les preuves, publie le rapport et notifie l equipe sécurité.",
		"Sans template, le scan part bien mais la cloture varie selon l auteur : preuves partielles et notifications tardives.",
		"Audit trace",
		"security workflow"
	),
	DATA_SYNC(
		"DATA_SYNC",
		"Data Sync",
		"Synchronise des données avec un canevas stable et une étape centrale personnalisee.",
		"Preparation synchronisation",
		"Ouvre les credentials, verifie le mapping et reserve le journal de reprise.",
		"Synchronisation ciblee",
		"Transfere les lots, applique les transformations et contrôle les ecarts de volume en continu.",
		"Cloture synchronisation",
		"Reindexe les données, ferme le journal de reprise et diffuse le récapitulatif d exécution.",
		"Sans template, la synchro est relancee depuis du code copie-colle et la phase de reindexation saute facilement.",
		"Sync coherente",
		"data workflow"
	);

	private final String code;
	private final String label;
	private final String description;
	private final String prepareLabel;
	private final String prepareDetail;
	private final String executeLabel;
	private final String executeDetail;
	private final String finalizeLabel;
	private final String finalizeDetail;
	private final String manualDriftDetail;
	private final String successLabel;
	private final String ambianceLabel;

	TemplateWorkflowProfile(
		String code,
		String label,
		String description,
		String prepareLabel,
		String prepareDetail,
		String executeLabel,
		String executeDetail,
		String finalizeLabel,
		String finalizeDetail,
		String manualDriftDetail,
		String successLabel,
		String ambianceLabel
	) {
		this.code = code;
		this.label = label;
		this.description = description;
		this.prepareLabel = prepareLabel;
		this.prepareDetail = prepareDetail;
		this.executeLabel = executeLabel;
		this.executeDetail = executeDetail;
		this.finalizeLabel = finalizeLabel;
		this.finalizeDetail = finalizeDetail;
		this.manualDriftDetail = manualDriftDetail;
		this.successLabel = successLabel;
		this.ambianceLabel = ambianceLabel;
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

	public String prepareLabel() {
		return prepareLabel;
	}

	public String prepareDetail() {
		return prepareDetail;
	}

	public String executeLabel() {
		return executeLabel;
	}

	public String executeDetail() {
		return executeDetail;
	}

	public String finalizeLabel() {
		return finalizeLabel;
	}

	public String finalizeDetail() {
		return finalizeDetail;
	}

	public String manualDriftDetail() {
		return manualDriftDetail;
	}

	public String successLabel() {
		return successLabel;
	}

	public String ambianceLabel() {
		return ambianceLabel;
	}

	public static TemplateWorkflowProfile fromCode(String rawCode) {
		return Arrays.stream(values())
			.filter(profile -> profile.code.equalsIgnoreCase(rawCode))
			.findFirst()
			.orElseThrow(() -> new InvalidPatternConfigurationException(
				"Workflow Template Method inconnu : " + rawCode
			));
	}
}
