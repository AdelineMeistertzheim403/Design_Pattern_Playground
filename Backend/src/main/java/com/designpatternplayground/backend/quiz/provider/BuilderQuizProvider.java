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
public class BuilderQuizProvider implements PatternQuizProvider {

	@Override
	public String getPatternCode() {
		return "builder";
	}

	@Override
	public PatternQuiz getQuiz() {
		return new PatternQuiz(
			getPatternCode(),
			"Quiz Builder",
			"Valide ta comprehension de la construction progressive, du director et du builder concret.",
			75,
			"Badge valide",
			0,
			List.of(
				singleChoice(
					"builder-q1",
					"Le pattern Builder permet surtout de :",
					EASY,
					"Builder construit un objet complexe etape par etape au lieu de passer une longue liste de parametres a un constructeur geant.",
					List.of(
						choice("share", "Partager la memoire"),
						choice("progressive", "Construire un objet progressivement"),
						choice("notify", "Notifier des abonnes")
					),
					"progressive"
				),
				trueFalse(
					"builder-q2",
					"Builder est utile quand la construction devient trop lourde pour un seul constructeur.",
					EASY,
					"C est justement le cas classique vise par Builder : une creation complexe, lisible et configurable.",
					true
				),
				singleChoice(
					"builder-q3",
					"Builder appartient a la famille :",
					EASY,
					"Builder est un pattern de creation.",
					List.of(
						choice("creational", "Creation"),
						choice("structural", "Structurel"),
						choice("behavioral", "Comportemental")
					),
					"creational"
				),
				singleChoice(
					"builder-q4",
					"Le Director sert principalement a :",
					MEDIUM,
					"Le Director garde un ordre de construction stable et orchestre les etapes du builder concret.",
					List.of(
						choice("store", "Stocker le produit final"),
						choice("orchestrate", "Orchestrer les etapes"),
						choice("render", "Afficher l interface")
					),
					"orchestrate"
				),
				matching(
					"builder-q5",
					"Associe chaque role Builder a sa responsabilite.",
					MEDIUM,
					"Le builder assemble, le director orchestre, le product represente l objet final.",
					List.of(
						item("builder", "Builder"),
						item("director", "Director"),
						item("product", "Product")
					),
					List.of(
						item("assemble", "Assemble les pieces"),
						item("order", "Orchestre l ordre"),
						item("result", "Objet final construit")
					),
					List.of(
						pair("builder", "assemble"),
						pair("director", "order"),
						pair("product", "result")
					)
				),
				singleChoice(
					"builder-q6",
					"Builder evite surtout :",
					MEDIUM,
					"Le pattern evite de laisser au client un constructeur geant rempli de parametres peu lisibles.",
					List.of(
						choice("interfaces", "Les interfaces"),
						choice("telescoping", "Les constructeurs geants"),
						choice("testing", "Les tests unitaires")
					),
					"telescoping"
				),
				trueFalse(
					"builder-q7",
					"Le meme processus Builder peut produire plusieurs variantes d un objet.",
					EASY,
					"Oui : on change les options ou le builder concret, mais on garde un flux de construction lisible.",
					true
				),
				singleChoice(
					"builder-q8",
					"Quel cas illustre bien Builder ?",
					EASY,
					"Assembler une voiture, une maison ou un personnage par etapes est un bon terrain pour Builder.",
					List.of(
						choice("car", "Assembler une voiture couche par couche"),
						choice("observer", "Notifier des observers"),
						choice("memory", "Compresser la memoire")
					),
					"car"
				),
				singleChoice(
					"builder-q9",
					"Builder separe principalement :",
					HARD,
					"Le pattern separe la logique de construction de la representation finale du produit.",
					List.of(
						choice("construction", "Construction et representation"),
						choice("state", "Etat et transition"),
						choice("pubsub", "Publication et abonnement")
					),
					"construction"
				),
				ordering(
					"builder-q10",
					"Remets le flux Builder dans le bon ordre.",
					HARD,
					"Le client demande, le director orchestre, le builder pose les etapes, puis le produit final est recupere.",
					List.of(
						orderingItem("request", "Le client demande un build"),
						orderingItem("director", "Le Director orchestre les etapes"),
						orderingItem("steps", "Le Builder pose les pieces une a une"),
						orderingItem("result", "Le produit final est recupere")
					),
					List.of("request", "director", "steps", "result")
				)
			)
		);
	}
}
