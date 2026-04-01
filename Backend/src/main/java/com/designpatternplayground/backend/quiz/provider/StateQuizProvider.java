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
public class StateQuizProvider implements PatternQuizProvider {

	@Override
	public String getPatternCode() {
		return "state";
	}

	@Override
	public PatternQuiz getQuiz() {
		return new PatternQuiz(
			getPatternCode(),
			"Quiz State",
			"Teste ta comprehension du contexte, des classes d etat et des transitions qui font varier le comportement.",
			75,
			"Badge valide",
			0,
			List.of(
				singleChoice(
					"state-q1",
					"Le pattern State permet de :",
					EASY,
					"State fait varier le comportement du contexte selon son etat courant.",
					List.of(
						choice("behavior", "Changer le comportement selon l etat"),
						choice("create", "Creer des objets"),
						choice("memory", "Optimiser la memoire")
					),
					"behavior"
				),
				trueFalse(
					"state-q2",
					"Le comportement depend de l etat courant.",
					EASY,
					"C est le principe du pattern : la reaction depend de l objet Etat actuellement actif.",
					true
				),
				singleChoice(
					"state-q3",
					"State remplace souvent :",
					MEDIUM,
					"Le pattern remplace des if/else ou switch complexes bases sur l etat.",
					List.of(
						choice("factory", "Factory"),
						choice("observer", "Observer"),
						choice("ifelse", "Des conditions if/else")
					),
					"ifelse"
				),
				singleChoice(
					"state-q4",
					"Chaque etat est souvent :",
					EASY,
					"On modele chaque etat comme une classe concrete qui implemente le contrat de comportement.",
					List.of(
						choice("variable", "Une variable"),
						choice("class", "Une classe"),
						choice("method", "Une methode")
					),
					"class"
				),
				matching(
					"state-q5",
					"Associe chaque etat a son comportement dominant.",
					MEDIUM,
					"Idle represente le repos, Running le mouvement, Jumping le saut.",
					List.of(
						item("idle", "Idle"),
						item("running", "Running"),
						item("jumping", "Jumping")
					),
					List.of(
						item("rest", "Repos"),
						item("move", "Mouvement"),
						item("jump", "Saut")
					),
					List.of(
						pair("idle", "rest"),
						pair("running", "move"),
						pair("jumping", "jump")
					)
				),
				singleChoice(
					"state-q6",
					"Le contexte contient :",
					MEDIUM,
					"Le contexte garde une reference sur l etat courant et lui delegue le comportement.",
					List.of(
						choice("hard-coded", "Tous les etats codes en dur"),
						choice("current", "Une reference vers l etat courant"),
						choice("none", "Aucun etat")
					),
					"current"
				),
				trueFalse(
					"state-q7",
					"State permet d eviter des switch complexes.",
					MEDIUM,
					"Le pattern distribue la logique dans des classes d etat au lieu de centraliser un gros bloc conditionnel.",
					true
				),
				singleChoice(
					"state-q8",
					"Qui change l etat ?",
					HARD,
					"Selon l implementation, c est souvent le contexte ou l etat courant qui decide de la transition suivante.",
					List.of(
						choice("client-only", "Le client uniquement"),
						choice("context-or-state", "Le contexte ou l etat"),
						choice("database", "La base de donnees")
					),
					"context-or-state"
				),
				singleChoice(
					"state-q9",
					"Le pattern State est :",
					EASY,
					"State appartient a la famille des patterns comportementaux.",
					List.of(
						choice("creational", "Creation"),
						choice("structural", "Structurel"),
						choice("behavioral", "Comportemental")
					),
					"behavioral"
				),
				singleChoice(
					"state-q10",
					"Quel est un bon exemple reel de State ?",
					HARD,
					"Une machine a etats de jeu ou d interface utilisateur illustre tres bien le pattern.",
					List.of(
						choice("calc", "Calcul"),
						choice("fsm", "Machine a etats (jeu, UI)"),
						choice("database", "Base de donnees")
					),
					"fsm"
				)
			)
		);
	}
}
