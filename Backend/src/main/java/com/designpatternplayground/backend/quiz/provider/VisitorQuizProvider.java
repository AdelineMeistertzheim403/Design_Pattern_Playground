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
public class VisitorQuizProvider implements PatternQuizProvider {

	@Override
	public String getPatternCode() {
		return "visitor";
	}

	@Override
	public PatternQuiz getQuiz() {
		return new PatternQuiz(
			getPatternCode(),
			"Quiz Visitor",
			"Teste ta comprehension du parcours d une structure et de l ajout de nouveaux comportements via un visitor.",
			75,
			"Badge valide",
			0,
			List.of(
				singleChoice(
					"visitor-q1",
					"Le pattern Visitor permet surtout de :",
					EASY,
					"Visitor ajoute une nouvelle operation sur une structure stable sans modifier les classes des elements.",
					List.of(
						choice("behavior", "Ajouter un comportement sans modifier les elements"),
						choice("clone", "Cloner des objets"),
						choice("memory", "Partager la memoire")
					),
					"behavior"
				),
				trueFalse(
					"visitor-q2",
					"Visitor appartient a la famille des patterns comportementaux.",
					EASY,
					"Oui : Visitor deplace le comportement de traitement hors des elements.",
					true
				),
				singleChoice(
					"visitor-q3",
					"Chaque element de la structure expose en general :",
					MEDIUM,
					"Chaque element propose une methode accept(visitor) pour dispatcher sur la bonne visite.",
					List.of(
						choice("accept", "Une methode accept(visitor)"),
						choice("factory", "Une factory statique"),
						choice("singleton", "Une instance globale")
					),
					"accept"
				),
				singleChoice(
					"visitor-q4",
					"Quel cas illustre bien Visitor ?",
					EASY,
					"Analyser un arbre de dossiers avec plusieurs traitements est un cas tres parlant.",
					List.of(
						choice("tree", "Analyser un arbre de fichiers avec plusieurs vues"),
						choice("payment", "Changer un mode de paiement"),
						choice("cache", "Mettre en cache une ressource")
					),
					"tree"
				),
				matching(
					"visitor-q5",
					"Associe chaque role Visitor a sa responsabilite.",
					MEDIUM,
					"Les elements acceptent, le visitor declare les operations, le concrete visitor porte l analyse.",
					List.of(
						item("element", "Element"),
						item("visitor", "Visitor"),
						item("concrete", "ConcreteVisitor")
					),
					List.of(
						item("accept", "Expose accept(visitor)"),
						item("contract", "Declare les visites"),
						item("logic", "Implemente un calcul concret")
					),
					List.of(
						pair("element", "accept"),
						pair("visitor", "contract"),
						pair("concrete", "logic")
					)
				),
				trueFalse(
					"visitor-q6",
					"Ajouter un nouveau Visitor evite souvent de modifier les classes d elements existantes.",
					MEDIUM,
					"Oui : c est l interet principal quand la structure est stable mais que les analyses evoluent.",
					true
				),
				singleChoice(
					"visitor-q7",
					"Le principal inconvenient de Visitor apparait quand :",
					HARD,
					"Ajouter un nouveau type d element force souvent a faire evoluer tous les visitors existants.",
					List.of(
						choice("element", "On ajoute souvent de nouveaux types d elements"),
						choice("analysis", "On ajoute de nouvelles analyses"),
						choice("logs", "On ajoute des logs")
					),
					"element"
				),
				singleChoice(
					"visitor-q8",
					"Visitor fonctionne tres bien avec :",
					MEDIUM,
					"Visitor et Composite forment un duo classique pour parcourir un arbre uniforme.",
					List.of(
						choice("composite", "Composite"),
						choice("singleton", "Singleton"),
						choice("proxy", "Proxy")
					),
					"composite"
				),
				singleChoice(
					"visitor-q9",
					"Dans le flux Visitor, le double dispatch sert a :",
					HARD,
					"Il permet d appeler la bonne methode de visite selon le type concret de l element.",
					List.of(
						choice("dispatch", "Choisir la bonne visite selon l element concret"),
						choice("cache", "Mettre la structure en cache"),
						choice("clone", "Dupliquer les noeuds")
					),
					"dispatch"
				),
				ordering(
					"visitor-q10",
					"Remets le flux Visitor dans le bon ordre.",
					HARD,
					"Le client choisit le visitor, le root accepte, chaque element dispatch sa visite, puis le resultat s agrege.",
					List.of(
						orderingItem("choose", "Le client choisit un visitor"),
						orderingItem("accept", "Le root lance accept(visitor)"),
						orderingItem("visit", "Chaque element appelle la bonne visite"),
						orderingItem("result", "Le resultat final est agrege")
					),
					List.of("choose", "accept", "visit", "result")
				)
			)
		);
	}
}
