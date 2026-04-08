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
public class ProxyQuizProvider implements PatternQuizProvider {

	@Override
	public String getPatternCode() {
		return "proxy";
	}

	@Override
	public PatternQuiz getQuiz() {
		return new PatternQuiz(
			getPatternCode(),
			"Quiz Proxy",
			"Teste ta comprehension du controle d acces, du lazy loading et du role d intermediaire du Proxy.",
			75,
			"Badge valide",
			0,
			List.of(
				singleChoice(
					"proxy-q1",
					"Le pattern Proxy permet surtout de :",
					EASY,
					"Proxy place un intermediaire devant une ressource pour controler, filtrer ou retarder l acces.",
					List.of(
						choice("access", "Controler l acces a une ressource"),
						choice("notify", "Notifier des abonnes"),
						choice("clone", "Cloner un objet")
					),
					"access"
				),
				trueFalse(
					"proxy-q2",
					"Proxy appartient a la famille des patterns structurels.",
					EASY,
					"Oui : Proxy est un pattern structurel.",
					true
				),
				singleChoice(
					"proxy-q3",
					"Le proxy et la ressource reelle exposent idealement :",
					MEDIUM,
					"Le client parle au meme contrat que la ressource reelle, sinon le remplacement devient visible.",
					List.of(
						choice("same", "Le meme contrat"),
						choice("db", "La meme base de donnees"),
						choice("none", "Aucune interface")
					),
					"same"
				),
				singleChoice(
					"proxy-q4",
					"Quel cas illustre bien Proxy ?",
					EASY,
					"Controler l acces a un flux video premium ou retarder son chargement est un bon exemple de Proxy.",
					List.of(
						choice("video", "Filtrer l acces a une ressource premium"),
						choice("payment", "Changer d algorithme de paiement"),
						choice("observer", "Diffuser un evenement")
					),
					"video"
				),
				matching(
					"proxy-q5",
					"Associe chaque role a sa responsabilite.",
					MEDIUM,
					"Le client demande, le proxy filtre ou charge, le real subject fait le vrai travail.",
					List.of(
						item("client", "Client"),
						item("proxy", "Proxy"),
						item("subject", "Real Subject")
					),
					List.of(
						item("request", "Demande l acces"),
						item("filter", "Filtre ou retarde l acces"),
						item("work", "Porte la vraie ressource")
					),
					List.of(
						pair("client", "request"),
						pair("proxy", "filter"),
						pair("subject", "work")
					)
				),
				trueFalse(
					"proxy-q6",
					"Un proxy peut servir a faire du lazy loading.",
					EASY,
					"Oui : le proxy peut differer le vrai chargement jusqu au moment ou la ressource est reellement demandee.",
					true
				),
				singleChoice(
					"proxy-q7",
					"Sans proxy, un probleme classique est :",
					MEDIUM,
					"Sans proxy, l acces direct peut lancer des chargements lourds trop tot ou exposer une ressource sensible.",
					List.of(
						choice("eager", "Un acces direct sans garde ni mediation"),
						choice("share", "Le partage d etat intrinseque"),
						choice("build", "Un constructeur geant")
					),
					"eager"
				),
				singleChoice(
					"proxy-q8",
					"Le proxy distant, de protection ou virtuel partage un principe commun :",
					HARD,
					"Tous restent une facade remplaçable devant le vrai sujet.",
					List.of(
						choice("middle", "Interposer un representant devant la vraie ressource"),
						choice("switch", "Remplacer des if / else"),
						choice("history", "Historiser des commandes")
					),
					"middle"
				),
				singleChoice(
					"proxy-q9",
					"Le client depend idealement de :",
					HARD,
					"Il depend du contrat du sujet, pas du proxy concret ni du real subject concret.",
					List.of(
						choice("contract", "L interface commune du sujet"),
						choice("proxy", "La classe Proxy concrete"),
						choice("real", "La classe RealSubject concrete")
					),
					"contract"
				),
				ordering(
					"proxy-q10",
					"Remets le flux Proxy dans le bon ordre.",
					HARD,
					"Le client demande, le proxy controle ou charge, le real subject est contacte si besoin, puis la reponse revient.",
					List.of(
						orderingItem("request", "Le client demande la ressource"),
						orderingItem("gate", "Le proxy controle l acces"),
						orderingItem("subject", "Le vrai sujet est contacte si necessaire"),
						orderingItem("return", "La reponse revient au client")
					),
					List.of("request", "gate", "subject", "return")
				)
			)
		);
	}
}
