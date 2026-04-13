package com.designpatternplayground.backend.quiz.provider;

import static com.designpatternplayground.backend.quiz.domain.QuestionDifficulty.EASY;
import static com.designpatternplayground.backend.quiz.domain.QuestionDifficulty.HARD;
import static com.designpatternplayground.backend.quiz.domain.QuestionDifficulty.MEDIUM;
import static com.designpatternplayground.backend.quiz.domain.QuizQuestions.choice;
import static com.designpatternplayground.backend.quiz.domain.QuizQuestions.item;
import static com.designpatternplayground.backend.quiz.domain.QuizQuestions.matching;
import static com.designpatternplayground.backend.quiz.domain.QuizQuestions.pair;
import static com.designpatternplayground.backend.quiz.domain.QuizQuestions.singleChoice;
import static com.designpatternplayground.backend.quiz.domain.QuizQuestions.trueFalse;

import java.util.List;

import org.springframework.stereotype.Component;

import com.designpatternplayground.backend.quiz.api.PatternQuizProvider;
import com.designpatternplayground.backend.quiz.domain.PatternQuiz;

@Component
public class MementoQuizProvider implements PatternQuizProvider {

	@Override
	public String getPatternCode() {
		return "memento";
	}

	@Override
	public PatternQuiz getQuiz() {
		return new PatternQuiz(
			getPatternCode(),
			"Quiz Memento",
			"Teste ta comprehension des snapshots, de la restauration et du role du caretaker.",
			75,
			"Badge valide",
			0,
			List.of(
				singleChoice(
					"memento-q1",
					"Le pattern Memento sert surtout a :",
					EASY,
					"Il capture un etat pour pouvoir le restaurer plus tard.",
					List.of(
						choice("restore", "Sauvegarder puis restaurer un etat"),
						choice("notify", "Notifier plusieurs abonnes"),
						choice("share", "Partager la memoire entre objets")
					),
					"restore"
				),
				trueFalse(
					"memento-q2",
					"Le client devrait modifier directement le contenu interne d un memento.",
					EASY,
					"Non : le but est justement de proteger l encapsulation de l originator.",
					false
				),
				singleChoice(
					"memento-q3",
					"Memento appartient a la famille :",
					EASY,
					"C est un pattern comportemental.",
					List.of(
						choice("creational", "Creation"),
						choice("structural", "Structurel"),
						choice("behavioral", "Comportemental")
					),
					"behavioral"
				),
				singleChoice(
					"memento-q4",
					"Le caretaker a pour role principal de :",
					MEDIUM,
					"Le caretaker stocke les snapshots sans connaitre leur structure interne.",
					List.of(
						choice("store", "Conserver les snapshots"),
						choice("mutate", "Modifier directement l originator"),
						choice("parse", "Interpréter un langage")
					),
					"store"
				),
				matching(
					"memento-q5",
					"Associe chaque role du pattern Memento a sa responsabilite.",
					MEDIUM,
					"L originator cree et restaure, le memento capture, le caretaker stocke.",
					List.of(
						item("originator", "Originator"),
						item("memento", "Memento"),
						item("caretaker", "Caretaker")
					),
					List.of(
						item("state", "Contient une capture d etat"),
						item("store", "Range les snapshots"),
						item("restore", "Cree et restaure l etat")
					),
					List.of(
						pair("originator", "restore"),
						pair("memento", "state"),
						pair("caretaker", "store")
					)
				),
				singleChoice(
					"memento-q6",
					"Memento evite surtout :",
					MEDIUM,
					"Il evite de casser l encapsulation juste pour faire undo / restore.",
					List.of(
						choice("encapsulation", "Casser l encapsulation pour restaurer un etat"),
						choice("inheritance", "Utiliser l heritage"),
						choice("network", "Faire des appels reseau")
					),
					"encapsulation"
				),
				trueFalse(
					"memento-q7",
					"On peut s appuyer sur Memento pour construire un historique undo / redo.",
					EASY,
					"Oui : une pile de snapshots est un cas d usage classique.",
					true
				),
				singleChoice(
					"memento-q8",
					"Quel exemple illustre bien Memento ?",
					EASY,
					"Un editeur ou un jeu avec savepoints est un excellent exemple.",
					List.of(
						choice("savepoint", "Un jeu avec savepoints ou rewind"),
						choice("factory", "Une fabrique de vehicules"),
						choice("observer", "Un systeme pub/sub")
					),
					"savepoint"
				),
				singleChoice(
					"memento-q9",
					"Le snapshot doit idealement contenir :",
					HARD,
					"L etat necessaire a une restauration coherente, pas seulement quelques notes visibles.",
					List.of(
						choice("full", "L etat necessaire a une restauration coherente"),
						choice("partial", "Seulement un titre et une date"),
						choice("none", "Aucun etat, seulement un identifiant")
					),
					"full"
				),
				singleChoice(
					"memento-q10",
					"Quel risque apparait si on accumule des mementos volumineux sans limite ?",
					HARD,
					"Le pattern peut devenir couteux en memoire si on garde trop de snapshots lourds.",
					List.of(
						choice("memory", "Un cout memoire important"),
						choice("observer", "Un couplage pub/sub"),
						choice("factory", "Une creation trop centralisee")
					),
					"memory"
				)
			)
		);
	}
}
