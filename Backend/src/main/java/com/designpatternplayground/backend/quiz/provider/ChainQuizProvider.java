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
public class ChainQuizProvider implements PatternQuizProvider {

	@Override
	public String getPatternCode() {
		return "chain";
	}

	@Override
	public PatternQuiz getQuiz() {
		return new PatternQuiz(
			getPatternCode(),
			"Quiz Chain of Responsibility",
			"Teste ta comprehension d une requete qui traverse une chaine de handlers capables de laisser passer, bloquer ou traiter le flux.",
			75,
			"Badge valide",
			0,
			List.of(
				singleChoice(
					"chain-q1",
					"Le pattern Chain of Responsibility permet surtout de :",
					EASY,
					"Chaque handler decide localement s il traite la requete ou s il la transmet au maillon suivant.",
					List.of(
						choice("create", "Creer des objets"),
						choice("route", "Faire circuler une requete entre plusieurs handlers"),
						choice("share", "Partager la memoire")
					),
					"route"
				),
				trueFalse(
					"chain-q2",
					"Un handler peut stopper la chaine avant le dernier maillon.",
					EASY,
					"Oui : si une condition echoue, le handler courant peut rejeter la requete et ne pas deleguer plus loin.",
					true
				),
				singleChoice(
					"chain-q3",
					"Chain of Responsibility est un pattern :",
					EASY,
					"Il s agit d un pattern comportemental.",
					List.of(
						choice("creational", "De creation"),
						choice("structural", "Structurel"),
						choice("behavioral", "Comportemental")
					),
					"behavioral"
				),
				singleChoice(
					"chain-q4",
					"Quel avantage apporte la chaine par rapport a un gros controller plein de if / else ?",
					MEDIUM,
					"Chaque controle reste localise dans un handler specialise plutot que centralise dans une seule methode.",
					List.of(
						choice("faster", "Toujours plus rapide"),
						choice("local", "Chaque regle reste dans un handler dedie"),
						choice("singleton", "Une seule instance imposee")
					),
					"local"
				),
				matching(
					"chain-q5",
					"Associe chaque role a sa responsabilite.",
					MEDIUM,
					"Le client envoie la requete, le handler la traite ou la transmet, le next handler prend la suite si necessaire.",
					List.of(
						item("client", "Client"),
						item("handler", "Handler"),
						item("next", "Next handler")
					),
					List.of(
						item("send", "Envoie la requete"),
						item("decide", "Traite ou transmet"),
						item("continue", "Poursuit la chaine")
					),
					List.of(
						pair("client", "send"),
						pair("handler", "decide"),
						pair("next", "continue")
					)
				),
				trueFalse(
					"chain-q6",
					"Tous les handlers doivent obligatoirement traiter la requete.",
					MEDIUM,
					"Non : beaucoup de handlers ne font que verifier une condition puis laisser passer.",
					false
				),
				singleChoice(
					"chain-q7",
					"Quel exemple illustre bien Chain of Responsibility ?",
					EASY,
					"Les pipelines d authentification, validation, moderation ou support multi-niveaux sont des exemples typiques.",
					List.of(
						choice("pipeline", "Pipeline auth / validation / traitement"),
						choice("dto", "DTO"),
						choice("entity", "Entite de base de donnees")
					),
					"pipeline"
				),
				singleChoice(
					"chain-q8",
					"Si un payload est invalide, que fait typiquement le ValidationHandler ?",
					MEDIUM,
					"Il rejette la requete et la chaine s arrete avant le traitement metier.",
					List.of(
						choice("ignore", "Il ignore le probleme et continue"),
						choice("reject", "Il bloque la requete"),
						choice("create", "Il cree un nouveau handler")
					),
					"reject"
				),
				singleChoice(
					"chain-q9",
					"Chain of Responsibility aide surtout a :",
					HARD,
					"Le pattern reduit le couplage entre l emetteur et le maillon final qui traitera vraiment la requete.",
					List.of(
						choice("decouple", "Decoupler emetteur et traitement final"),
						choice("memory", "Compresser la memoire"),
						choice("inheritance", "Imposer une hierarchie profonde")
					),
					"decouple"
				),
				ordering(
					"chain-q10",
					"Remets le pipeline dans le bon ordre.",
					HARD,
					"La requete entre, passe l auth, puis la validation, puis le traitement final si rien ne bloque avant.",
					List.of(
						orderingItem("request", "La requete entre dans la chaine"),
						orderingItem("auth", "AuthenticationHandler controle l acces"),
						orderingItem("validation", "ValidationHandler controle le payload"),
						orderingItem("processing", "ProcessingHandler traite la requete")
					),
					List.of("request", "auth", "validation", "processing")
				)
			)
		);
	}
}
