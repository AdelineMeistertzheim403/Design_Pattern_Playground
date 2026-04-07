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
public class CommandQuizProvider implements PatternQuizProvider {

	@Override
	public String getPatternCode() {
		return "command";
	}

	@Override
	public PatternQuiz getQuiz() {
		return new PatternQuiz(
			getPatternCode(),
			"Quiz Command",
			"Teste ta comprehension des requetes encapsulees, de l invoker, du receiver et de la reversibilite undo / redo.",
			75,
			"Badge valide",
			0,
			List.of(
				singleChoice(
					"command-q1",
					"Le pattern Command permet surtout de :",
					EASY,
					"Command encapsule une requete dans un objet pour pouvoir la declencher, la stocker ou l annuler.",
					List.of(
						choice("create", "Creer des objets"),
						choice("memory", "Partager la memoire"),
						choice("encapsulate", "Encapsuler une action dans un objet")
					),
					"encapsulate"
				),
				trueFalse(
					"command-q2",
					"Une commande peut etre historisee puis rejouee plus tard.",
					EASY,
					"C est justement l un des grands interets du pattern pour l historique, les files ou les macros.",
					true
				),
				singleChoice(
					"command-q3",
					"Command appartient a la famille :",
					EASY,
					"Command est un pattern comportemental.",
					List.of(
						choice("creational", "Creation"),
						choice("structural", "Structurel"),
						choice("behavioral", "Comportemental")
					),
					"behavioral"
				),
				singleChoice(
					"command-q4",
					"Quel role declenche les commandes sans connaitre leur implementation detaillee ?",
					MEDIUM,
					"L invoker lance une commande via son contrat sans connaitre les details du receiver.",
					List.of(
						choice("receiver", "Le receiver"),
						choice("invoker", "L invoker"),
						choice("database", "La base de donnees")
					),
					"invoker"
				),
				matching(
					"command-q5",
					"Associe chaque role a sa responsabilite.",
					MEDIUM,
					"La commande encapsule, l invoker declenche, le receiver effectue le vrai travail.",
					List.of(
						item("command", "Command"),
						item("invoker", "Invoker"),
						item("receiver", "Receiver")
					),
					List.of(
						item("encapsulate", "Encapsule l action"),
						item("trigger", "Declenche"),
						item("execute", "Execute le vrai travail")
					),
					List.of(
						pair("command", "encapsulate"),
						pair("invoker", "trigger"),
						pair("receiver", "execute")
					)
				),
				singleChoice(
					"command-q6",
					"Pourquoi Command facilite-t-il undo / redo ?",
					HARD,
					"Chaque action existe comme objet autonome, donc on peut la conserver dans un historique et la rejouer ou l annuler.",
					List.of(
						choice("history", "Parce que les actions sont historisees comme objets"),
						choice("inheritance", "Parce qu il utilise surtout l heritage"),
						choice("singleton", "Parce qu il impose une instance unique")
					),
					"history"
				),
				trueFalse(
					"command-q7",
					"Sans Command, un bouton Undo devient souvent plus difficile a implementer proprement.",
					MEDIUM,
					"Sans objet commande et sans historique explicite, il faut reconstruire l etat avec une logique plus fragile.",
					true
				),
				singleChoice(
					"command-q8",
					"Quel exemple illustre bien Command ?",
					EASY,
					"Un editeur avec undo / redo ou un simulateur d actions joueur sont des exemples tres classiques.",
					List.of(
						choice("editor", "Editeur avec undo / redo"),
						choice("entity", "Entite JPA"),
						choice("dto", "DTO")
					),
					"editor"
				),
				singleChoice(
					"command-q9",
					"Le receiver :",
					MEDIUM,
					"Le receiver est l objet qui sait vraiment comment effectuer l action metier.",
					List.of(
						choice("real-work", "Porte le vrai comportement metier"),
						choice("history", "Stocke uniquement l historique"),
						choice("choose", "Choisit toujours la commande")
					),
					"real-work"
				),
				ordering(
					"command-q10",
					"Remets la boucle Command dans le bon ordre.",
					HARD,
					"Le client cree la commande, l invoker la declenche, le receiver agit, puis l historique permet undo / redo.",
					List.of(
						orderingItem("create", "Le client cree la commande"),
						orderingItem("trigger", "L invoker declenche la commande"),
						orderingItem("execute", "Le receiver applique l action"),
						orderingItem("history", "L historique permet undo / redo")
					),
					List.of("create", "trigger", "execute", "history")
				)
			)
		);
	}
}
