package com.designpatternplayground.backend.pattern.bootstrap;

import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.designpatternplayground.backend.pattern.domain.PatternCategory;
import com.designpatternplayground.backend.pattern.domain.PatternExample;
import com.designpatternplayground.backend.pattern.domain.PatternExampleRepository;

@Component
public class PatternCatalogSeeder implements CommandLineRunner {

	private final PatternExampleRepository repository;

	public PatternCatalogSeeder(PatternExampleRepository repository) {
		this.repository = repository;
	}

	@Override
	public void run(String... args) {
		if (repository.count() > 0) {
			return;
		}

		repository.saveAll(List.of(
			new PatternExample(
				"factory-method",
				"Factory Method",
				PatternCategory.CREATION,
				"Delegue la creation d'un objet a une fabrique specialisee pour eviter les constructions disperses.",
				"Une factory produit les services ou demos a exposer via l'API sans brancher toute la logique dans le controller.",
				"Le front choisit dynamiquement le bon composant de rendu selon le pattern selectionne.",
				"Point d'appui ideal pour presenter la difference entre creation centralisee, testabilite et couplage reduit."
			),
			new PatternExample(
				"adapter",
				"Adapter",
				PatternCategory.STRUCTURE,
				"Transforme une interface existante en une interface attendue par le client.",
				"Permet d'envelopper une API externe, un legacy service ou une source de donnees heterogene.",
				"Uniformise des formats retournes par plusieurs endpoints ou plusieurs widgets React.",
				"Ce pattern est utile des qu'un composant ne doit pas connaitre les details d'un systeme tiers."
			),
			new PatternExample(
				"decorator",
				"Decorator",
				PatternCategory.STRUCTURE,
				"Ajoute des responsabilites a un objet sans multiplier les sous-classes.",
				"Peut enrichir une reponse, ajouter des logs, du cache ou du monitoring autour d'un service.",
				"Permet d'empiler des comportements UI comme badges, metriques ou overlays sans dupliquer le composant de base.",
				"Le point cle a montrer est la composition dynamique, plus souple qu'une hierarchie de classes."
			),
			new PatternExample(
				"observer",
				"Observer",
				PatternCategory.COMPORTEMENT,
				"Diffuse un changement d'etat a plusieurs abonnes sans couplage direct entre emetteur et recepteurs.",
				"Se traduit bien avec des evenements de domaine, des listeners Spring ou une file de messages.",
				"Correspond a la propagation d'etat via hooks, store global ou WebSocket pour rafraichir plusieurs vues.",
				"Bon candidat pour expliquer la propagation des evenements et les risques de cascades non maitrisees."
			),
			new PatternExample(
				"strategy",
				"Strategy",
				PatternCategory.COMPORTEMENT,
				"Definit plusieurs variantes d'un algorithme et laisse le client choisir celle qui convient.",
				"L'API de preview selectionne ici une strategie de rendu pour produire une vue textuelle ou checklist.",
				"Le front peut basculer entre plusieurs modes de lecture sans recharger toute la page.",
				"C'est le pattern le plus immediat a demontrer car le changement de comportement est visible et localise."
			)
		));
	}
}
