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
public class InterpreterQuizProvider implements PatternQuizProvider {

	@Override
	public String getPatternCode() {
		return "interpreter";
	}

	@Override
	public PatternQuiz getQuiz() {
		return new PatternQuiz(
			getPatternCode(),
			"Quiz Interpreter",
			"Teste ta comprehension du parsing, des expressions et de l execution d un mini langage.",
			75,
			"Badge valide",
			0,
			List.of(
				singleChoice(
					"interpreter-q1",
					"Le pattern Interpreter sert surtout a :",
					EASY,
					"Interpreter execute un langage ou une grammaire a partir d expressions.",
					List.of(
						choice("language", "Executer un mini langage"),
						choice("notify", "Notifier des abonnes"),
						choice("share", "Partager la memoire")
					),
					"language"
				),
				trueFalse(
					"interpreter-q2",
					"Interpreter appartient a la famille des patterns comportementaux.",
					EASY,
					"Oui : il decrit comment interpreter des commandes a partir d un contexte.",
					true
				),
				singleChoice(
					"interpreter-q3",
					"Dans une solution Interpreter, chaque symbole du langage devient souvent :",
					MEDIUM,
					"Chaque instruction ou regle est representee par une expression capable de s interpreter elle-meme.",
					List.of(
						choice("class", "Une expression ou une classe"),
						choice("cookie", "Un cookie"),
						choice("style", "Une feuille CSS")
					),
					"class"
				),
				singleChoice(
					"interpreter-q4",
					"Le contexte dans Interpreter contient en general :",
					MEDIUM,
					"Le contexte stocke l etat courant utile a l execution des expressions.",
					List.of(
						choice("state", "L etat courant de l execution"),
						choice("images", "Uniquement des images"),
						choice("none", "Aucune donnee")
					),
					"state"
				),
				matching(
					"interpreter-q5",
					"Associe chaque notion Interpreter a son role.",
					MEDIUM,
					"Le contexte porte l etat, l expression execute une regle et la grammaire structure le langage.",
					List.of(
						item("context", "Context"),
						item("expression", "Expression"),
						item("grammar", "Grammar")
					),
					List.of(
						item("state", "Etat de l execution"),
						item("rule", "Regle executable"),
						item("language", "Structure du langage")
					),
					List.of(
						pair("context", "state"),
						pair("expression", "rule"),
						pair("grammar", "language")
					)
				),
				singleChoice(
					"interpreter-q6",
					"Quel cas colle bien a Interpreter ?",
					EASY,
					"Un mini langage de commandes, de filtres ou de regles correspond bien au pattern.",
					List.of(
						choice("script", "Un script MOVE / TURN / ATTACK"),
						choice("socket", "Un driver reseau bas niveau"),
						choice("image", "Une simple image statique")
					),
					"script"
				),
				trueFalse(
					"interpreter-q7",
					"Un bloc REPEAT peut etre represente par une expression composite contenant d autres expressions.",
					MEDIUM,
					"C est une bonne facon de modeliser un petit langage imbrique.",
					true
				),
				singleChoice(
					"interpreter-q8",
					"Sans Interpreter, un client qui lit le script a la main risque surtout de :",
					MEDIUM,
					"Les structures plus riches comme les blocs ou les conditions deviennent fragiles sans modele formel du langage.",
					List.of(
						choice("fragile", "Multiplier les if / else fragiles"),
						choice("memory", "Optimiser la memoire automatiquement"),
						choice("share", "Partager les textures")
					),
					"fragile"
				),
				singleChoice(
					"interpreter-q9",
					"Le vrai gain pedagogique du pattern Interpreter est de montrer :",
					HARD,
					"On voit la difference entre lire des chaines a la main et modeliser une vraie grammaire executable.",
					List.of(
						choice("parse", "Parsing + arbre syntaxique + execution"),
						choice("db", "Tables SQL + migrations"),
						choice("cache", "Cache HTTP")
					),
					"parse"
				),
				ordering(
					"interpreter-q10",
					"Remets le flux Interpreter dans le bon ordre.",
					HARD,
					"On ecrit le script, on le parse, on construit les expressions, puis on execute le contexte.",
					List.of(
						orderingItem("write", "Ecrire le script"),
						orderingItem("parse", "Parser les lignes"),
						orderingItem("ast", "Construire les expressions"),
						orderingItem("run", "Executer le contexte")
					),
					List.of("write", "parse", "ast", "run")
				)
			)
		);
	}
}
