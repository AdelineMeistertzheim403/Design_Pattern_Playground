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
public class MediatorQuizProvider implements PatternQuizProvider {

	@Override
	public String getPatternCode() {
		return "mediator";
	}

	@Override
	public PatternQuiz getQuiz() {
		return new PatternQuiz(
			getPatternCode(),
			"Quiz Mediator",
			"Teste ta comprehension d un hub central qui coordonne les echanges entre plusieurs colleagues sans les coupler directement.",
			75,
			"Badge valide",
			0,
			List.of(
				singleChoice(
					"mediator-q1",
					"Le pattern Mediator sert surtout a :",
					EASY,
					"Il centralise les interactions entre objets pour reduire les dependances directes entre eux.",
					List.of(
						choice("create", "Creer des objets"),
						choice("centralize", "Centraliser les interactions"),
						choice("share", "Partager la memoire")
					),
					"centralize"
				),
				trueFalse(
					"mediator-q2",
					"Dans une implementation classique, les colleagues passent idealement par le mediator plutot que de se parler tous directement.",
					EASY,
					"C est le coeur du pattern : les objets collaborent via le mediator central.",
					true
				),
				singleChoice(
					"mediator-q3",
					"Mediator appartient a la famille :",
					EASY,
					"Mediator est un pattern comportemental.",
					List.of(
						choice("creational", "Creation"),
						choice("structural", "Structurel"),
						choice("behavioral", "Comportemental")
					),
					"behavioral"
				),
				singleChoice(
					"mediator-q4",
					"Quel avantage principal apporte Mediator dans un chat ?",
					MEDIUM,
					"Chaque joueur depend du hub central plutot que de tous les autres joueurs.",
					List.of(
						choice("faster", "Toujours plus rapide"),
						choice("decouple", "Reduction du couplage entre participants"),
						choice("inheritance", "Plus d heritage")
					),
					"decouple"
				),
				matching(
					"mediator-q5",
					"Associe chaque role a sa responsabilite.",
					MEDIUM,
					"Le mediator coordonne, le colleague envoie ou recoit, le concrete mediator implemente la coordination.",
					List.of(
						item("mediator", "Mediator"),
						item("colleague", "Colleague"),
						item("concrete", "ConcreteMediator")
					),
					List.of(
						item("coordinate", "Coordonne les echanges"),
						item("participate", "Envoie / recoit des messages"),
						item("implement", "Porte la logique centrale")
					),
					List.of(
						pair("mediator", "coordinate"),
						pair("colleague", "participate"),
						pair("concrete", "implement")
					)
				),
				trueFalse(
					"mediator-q6",
					"Sans Mediator, un systeme de chat peut vite accumuler des liens directs entre participants.",
					MEDIUM,
					"Oui : chaque participant doit connaitre plusieurs autres objets au lieu de dependance unique vers le hub.",
					true
				),
				singleChoice(
					"mediator-q7",
					"Quel exemple illustre bien Mediator ?",
					EASY,
					"Un salon de chat, une tour de controle ou une salle de jeu avec hub central sont des exemples classiques.",
					List.of(
						choice("chat", "Salon de chat"),
						choice("dto", "DTO"),
						choice("table", "Table SQL")
					),
					"chat"
				),
				singleChoice(
					"mediator-q8",
					"Quand un nouveau participant rejoint, quel objet central evolue le plus naturellement ?",
					MEDIUM,
					"On met a jour le mediator central plutot que tous les participants existants.",
					List.of(
						choice("mediator", "Le mediator"),
						choice("all", "Tous les colleagues entre eux"),
						choice("database", "La base de donnees uniquement")
					),
					"mediator"
				),
				singleChoice(
					"mediator-q9",
					"Le risque classique de Mediator est :",
					HARD,
					"Le hub central peut devenir trop gros s il absorbe trop de logique applicative.",
					List.of(
						choice("god", "Un mediator qui devient un god object"),
						choice("memory", "Une memoire partagee par tous"),
						choice("factory", "Une fabrique obligatoire")
					),
					"god"
				),
				ordering(
					"mediator-q10",
					"Remets la boucle Mediator dans le bon ordre.",
					HARD,
					"Le participant envoie au mediator, le mediator decide les destinataires, puis il relaie les messages.",
					List.of(
						orderingItem("send", "Le participant envoie un message"),
						orderingItem("hub", "Le mediator recoit et coordonne"),
						orderingItem("relay", "Le mediator relaie aux destinataires"),
						orderingItem("receive", "Les autres participants recoivent le message")
					),
					List.of("send", "hub", "relay", "receive")
				)
			)
		);
	}
}
