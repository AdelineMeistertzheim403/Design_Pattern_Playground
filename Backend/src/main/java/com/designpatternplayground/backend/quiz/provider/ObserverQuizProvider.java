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
public class ObserverQuizProvider implements PatternQuizProvider {

	@Override
	public String getPatternCode() {
		return "observer";
	}

	@Override
	public PatternQuiz getQuiz() {
		return new PatternQuiz(
			getPatternCode(),
			"Quiz Observer",
			"Valide le mecanisme d abonnement, de notification et de decouplage entre le sujet et ses observers.",
			75,
			"Badge valide",
			0,
			List.of(
				singleChoice(
					"observer-q1",
					"Observer permet surtout de :",
					EASY,
					"Observer permet a un sujet de notifier plusieurs abonnes lorsqu un evenement survient.",
					List.of(
						choice("create", "Creer des objets"),
						choice("notify", "Notifier des abonnes"),
						choice("store", "Stocker des donnees")
					),
					"notify"
				),
				trueFalse(
					"observer-q2",
					"Observer est base sur une logique pub/sub.",
					EASY,
					"Le sujet publie un changement, les observers inscrits recoivent la mise a jour.",
					true
				),
				singleChoice(
					"observer-q3",
					"Le sujet :",
					EASY,
					"Le sujet maintient la liste des abonnes et declenche les notifications.",
					List.of(
						choice("listen", "Ecoute"),
						choice("notify", "Notifie"),
						choice("ignore", "Ignore")
					),
					"notify"
				),
				singleChoice(
					"observer-q4",
					"Les observers :",
					EASY,
					"Les observers recoivent les updates du sujet et reagissent chacun a leur maniere.",
					List.of(
						choice("receive", "Recoivent les updates"),
						choice("create", "Creent les sujets"),
						choice("store", "Stockent les donnees")
					),
					"receive"
				),
				matching(
					"observer-q5",
					"Associe chaque terme a son role.",
					MEDIUM,
					"Le subject est la source, l observer ecoute, notify represente l evenement diffuse.",
					List.of(
						item("subject", "Subject"),
						item("observer", "Observer"),
						item("notify", "Notify")
					),
					List.of(
						item("source", "Source"),
						item("listen", "Ecoute"),
						item("event", "Evenement")
					),
					List.of(
						pair("subject", "source"),
						pair("observer", "listen"),
						pair("notify", "event")
					)
				),
				singleChoice(
					"observer-q6",
					"Observer est un pattern :",
					EASY,
					"Observer appartient a la famille des patterns comportementaux.",
					List.of(
						choice("creational", "Creation"),
						choice("structural", "Structurel"),
						choice("behavioral", "Comportemental")
					),
					"behavioral"
				),
				trueFalse(
					"observer-q7",
					"On peut avoir plusieurs observers sur un meme sujet.",
					EASY,
					"C est meme la raison d etre du pattern : diffuser a plusieurs abonnes sans coupler le sujet a chacun d eux.",
					true
				),
				singleChoice(
					"observer-q8",
					"Quel exemple illustre bien Observer ?",
					EASY,
					"Un systeme de notifications ou d evenements UI est un bon cas d usage.",
					List.of(
						choice("calc", "Calcul"),
						choice("notifications", "Notifications"),
						choice("database", "Base de donnees")
					),
					"notifications"
				),
				singleChoice(
					"observer-q9",
					"Observer permet surtout :",
					MEDIUM,
					"Le sujet depend d un contrat observer, pas des implementations concretes des abonnes.",
					List.of(
						choice("decoupling", "Decouplage"),
						choice("strong", "Dependance forte"),
						choice("less-code", "Moins de code")
					),
					"decoupling"
				),
				singleChoice(
					"observer-q10",
					"Quand utiliser Observer ?",
					HARD,
					"Quand un changement d etat doit etre diffuse vers plusieurs recepteurs potentiels.",
					List.of(
						choice("single-class", "Une seule classe"),
						choice("events", "Evenements"),
						choice("simple-logic", "Logique simple")
					),
					"events"
				)
			)
		);
	}
}
