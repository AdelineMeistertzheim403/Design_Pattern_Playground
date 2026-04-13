package com.designpatternplayground.backend.quiz.provider;

import static com.designpatternplayground.backend.quiz.domain.QuestionDifficulty.EASY;
import static com.designpatternplayground.backend.quiz.domain.QuestionDifficulty.HARD;
import static com.designpatternplayground.backend.quiz.domain.QuestionDifficulty.MEDIUM;
import static com.designpatternplayground.backend.quiz.domain.QuizQuestions.choice;
import static com.designpatternplayground.backend.quiz.domain.QuizQuestions.item;
import static com.designpatternplayground.backend.quiz.domain.QuizQuestions.matching;
import static com.designpatternplayground.backend.quiz.domain.QuizQuestions.ordering;
import static com.designpatternplayground.backend.quiz.domain.QuizQuestions.orderingItem;
import static com.designpatternplayground.backend.quiz.domain.QuizQuestions.pair;
import static com.designpatternplayground.backend.quiz.domain.QuizQuestions.singleChoice;
import static com.designpatternplayground.backend.quiz.domain.QuizQuestions.trueFalse;

import java.util.List;

import org.springframework.stereotype.Component;

import com.designpatternplayground.backend.quiz.api.PatternQuizProvider;
import com.designpatternplayground.backend.quiz.domain.PatternQuiz;

@Component
public class AbstractFactoryQuizProvider implements PatternQuizProvider {

	@Override
	public String getPatternCode() {
		return "abstract-factory";
	}

	@Override
	public PatternQuiz getQuiz() {
		return new PatternQuiz(
			getPatternCode(),
			"Quiz Abstract Factory",
			"Teste ta comprehension de la creation de familles d objets coherentes.",
			75,
			"Badge valide",
			0,
			List.of(
				singleChoice(
					"abstract-factory-q1",
					"Abstract Factory sert surtout a :",
					EASY,
					"Il cree des familles d objets coherentes sans exposer les classes concretes au client.",
					List.of(
						choice("family", "Creer des familles d objets coherentes"),
						choice("undo", "Restaurer un snapshot"),
						choice("notify", "Notifier plusieurs observers")
					),
					"family"
				),
				trueFalse(
					"abstract-factory-q2",
					"Abstract Factory appartient aux patterns de creation.",
					EASY,
					"Oui : il organise la creation de plusieurs produits relies entre eux.",
					true
				),
				singleChoice(
					"abstract-factory-q3",
					"Par rapport a Factory Method, Abstract Factory ajoute surtout :",
					MEDIUM,
					"La notion cle est la famille d objets coherente, pas un produit isole.",
					List.of(
						choice("family", "La creation de plusieurs produits relies"),
						choice("singleton", "Une seule instance globale"),
						choice("visitor", "Un parcours sur une structure")
					),
					"family"
				),
				singleChoice(
					"abstract-factory-q4",
					"Dans un Theme Generator, la factory abstraite garantit :",
					MEDIUM,
					"Tous les objets produits appartiennent au meme univers visuel.",
					List.of(
						choice("coherent", "Une coherence entre hero, transport et relique"),
						choice("faster", "Une execution plus rapide"),
						choice("cache", "Un partage memoire")
					),
					"coherent"
				),
				matching(
					"abstract-factory-q5",
					"Associe chaque element a son role dans Abstract Factory.",
					MEDIUM,
					"La factory abstraite declare les methodes, la factory concrete choisit la famille, et les produits concrets composent le theme.",
					List.of(
						item("abstractFactory", "Abstract Factory"),
						item("concreteFactory", "Concrete Factory"),
						item("productFamily", "Concrete Products")
					),
					List.of(
						item("contract", "Declare createHero(), createTransport(), createRelic()"),
						item("theme", "Choisit Sci-Fi ou Medieval"),
						item("objects", "Fournit les objets concrets du theme")
					),
					List.of(
						pair("abstractFactory", "contract"),
						pair("concreteFactory", "theme"),
						pair("productFamily", "objects")
					)
				),
				singleChoice(
					"abstract-factory-q6",
					"Quel risque evitons-nous sans Abstract Factory ?",
					EASY,
					"Le client peut sinon melanger des objets issus de familles incompatibles.",
					List.of(
						choice("mix", "Melanger des produits de themes differents"),
						choice("network", "Perdre la connexion reseau"),
						choice("cursor", "Perdre la position d un iterator")
					),
					"mix"
				),
				trueFalse(
					"abstract-factory-q7",
					"Le client devrait connaitre directement les classes concretes de chaque produit.",
					MEDIUM,
					"Faux : le but est justement de masquer les classes concretes derriere la famille abstraite.",
					false
				),
				singleChoice(
					"abstract-factory-q8",
					"Quel exemple illustre bien Abstract Factory ?",
					MEDIUM,
					"Un generateur de theme complet est l exemple classique : plusieurs objets doivent rester coherents ensemble.",
					List.of(
						choice("theme", "Un generateur Sci-Fi / Medieval qui cree plusieurs objets assortis"),
						choice("undo", "Un historique de sauvegardes"),
						choice("pubsub", "Un sujet qui pousse des notifications")
					),
					"theme"
				),
				singleChoice(
					"abstract-factory-q9",
					"Quel couple est le plus suspect sans Abstract Factory ?",
					HARD,
					"Le probleme n est pas le produit seul mais le melange de familles concretes.",
					List.of(
						choice("mismatch", "Knight Champion + Hoverbike futuriste dans la meme famille medievale"),
						choice("same", "Nova Pilot + Hoverbike dans le meme theme sci-fi"),
						choice("stable", "Runic Banner + Warhorse dans le meme theme medieval")
					),
					"mismatch"
				),
				ordering(
					"abstract-factory-q10",
					"Remets le flux Abstract Factory dans le bon ordre.",
					HARD,
					"Le client choisit un theme, selectionne la factory concrete, recupere une famille complete puis verifie la coherence.",
					List.of(
						orderingItem("choose", "Le client choisit un theme"),
						orderingItem("factory", "La factory concrete correspondante est selectionnee"),
						orderingItem("products", "Les produits coherents sont crees"),
						orderingItem("result", "La famille finale est livree au client")
					),
					List.of("choose", "factory", "products", "result")
				)
			)
		);
	}
}
