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
public class StrategyQuizProvider implements PatternQuizProvider {

	@Override
	public String getPatternCode() {
		return "strategy";
	}

	@Override
	public PatternQuiz getQuiz() {
		return new PatternQuiz(
			getPatternCode(),
			"Quiz Strategy",
			"Teste ta comprehension des algorithmes interchangeables, du contexte et du choix dynamique de comportement.",
			75,
			"Badge valide",
			0,
			List.of(
				singleChoice(
					"strategy-q1",
					"Strategy permet :",
					EASY,
					"Le pattern encapsule des algorithmes pour pouvoir en changer a l execution.",
					List.of(
						choice("algorithm", "Changer d algorithme"),
						choice("objects", "Creer des objets"),
						choice("data", "Stocker des donnees")
					),
					"algorithm"
				),
				trueFalse(
					"strategy-q2",
					"Strategy encapsule des comportements.",
					EASY,
					"Chaque strategie concrete porte un comportement ou un algorithme bien defini.",
					true
				),
				singleChoice(
					"strategy-q3",
					"Strategy remplace souvent :",
					MEDIUM,
					"Le pattern est souvent utilise pour remplacer des branches conditionnelles qui choisissent un algorithme.",
					List.of(
						choice("factory", "Factory"),
						choice("observer", "Observer"),
						choice("ifelse", "if/else")
					),
					"ifelse"
				),
				singleChoice(
					"strategy-q4",
					"Une strategy est generalement :",
					EASY,
					"On modelise souvent chaque strategie comme une classe concrete derriere une interface commune.",
					List.of(
						choice("variable", "Une variable"),
						choice("class", "Une classe"),
						choice("interface-only", "Une interface seule")
					),
					"class"
				),
				matching(
					"strategy-q5",
					"Associe chaque role a sa responsabilite.",
					MEDIUM,
					"Le client choisit, le contexte utilise, la strategie porte le comportement concret.",
					List.of(
						item("strategy", "Strategy"),
						item("context", "Context"),
						item("client", "Client")
					),
					List.of(
						item("behavior", "Comportement"),
						item("use", "Utilise"),
						item("choose", "Choisit")
					),
					List.of(
						pair("strategy", "behavior"),
						pair("context", "use"),
						pair("client", "choose")
					)
				),
				singleChoice(
					"strategy-q6",
					"Strategy est un pattern :",
					EASY,
					"Strategy appartient a la famille des patterns comportementaux.",
					List.of(
						choice("creational", "Creation"),
						choice("structural", "Structurel"),
						choice("behavioral", "Comportemental")
					),
					"behavioral"
				),
				trueFalse(
					"strategy-q7",
					"On peut changer la strategy a runtime.",
					MEDIUM,
					"C est meme la promesse du pattern : changer l algorithme sans modifier le contexte.",
					true
				),
				singleChoice(
					"strategy-q8",
					"Quel exemple illustre bien Strategy ?",
					EASY,
					"Un mode de paiement interchangeable est un exemple classique et tres pedagogique.",
					List.of(
						choice("database", "Base de donnees"),
						choice("payment", "Paiement"),
						choice("ui", "UI")
					),
					"payment"
				),
				singleChoice(
					"strategy-q9",
					"Le context :",
					MEDIUM,
					"Le contexte delegue l execution a la strategie courante plutot que de coder l algorithme en dur.",
					List.of(
						choice("create-all", "Cree tout"),
						choice("use", "Utilise la strategy"),
						choice("ignore", "Ignore la strategy")
					),
					"use"
				),
				singleChoice(
					"strategy-q10",
					"Strategy apporte surtout :",
					HARD,
					"Le pattern apporte de la flexibilite et reduit le couplage entre le contexte et les variantes d algorithme.",
					List.of(
						choice("flexibility", "Flexibilite"),
						choice("rigidity", "Rigidite"),
						choice("strong-coupling", "Dependance forte")
					),
					"flexibility"
				)
			)
		);
	}
}
