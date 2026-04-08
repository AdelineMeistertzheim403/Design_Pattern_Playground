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
public class FacadeQuizProvider implements PatternQuizProvider {

	@Override
	public String getPatternCode() {
		return "facade";
	}

	@Override
	public PatternQuiz getQuiz() {
		return new PatternQuiz(
			getPatternCode(),
			"Quiz Facade",
			"Teste ta comprehension de la simplification d un systeme complexe par une entree unique.",
			75,
			"Badge valide",
			0,
			List.of(
				singleChoice(
					"facade-q1",
					"Le pattern Facade sert surtout a :",
					EASY,
					"Facade expose une API simple devant plusieurs sous-systemes.",
					List.of(
						choice("simplify", "Simplifier l acces a un systeme complexe"),
						choice("clone", "Cloner un objet"),
						choice("notify", "Notifier des abonnes")
					),
					"simplify"
				),
				trueFalse(
					"facade-q2",
					"Facade supprime les sous-systemes internes.",
					EASY,
					"Non : les sous-systemes existent toujours, mais on les masque derriere une interface plus simple.",
					false
				),
				singleChoice(
					"facade-q3",
					"Facade appartient a la famille :",
					EASY,
					"Facade est un pattern structurel.",
					List.of(
						choice("creational", "Creation"),
						choice("structural", "Structurel"),
						choice("behavioral", "Comportemental")
					),
					"structural"
				),
				singleChoice(
					"facade-q4",
					"Le client parle idealement a :",
					MEDIUM,
					"Le client depend de la facade simplifiee plutot que de tous les modules internes.",
					List.of(
						choice("facade", "Une interface Facade"),
						choice("all", "Tous les sous-systemes directement"),
						choice("db", "La base de donnees")
					),
					"facade"
				),
				matching(
					"facade-q5",
					"Associe chaque role Facade a sa responsabilite.",
					MEDIUM,
					"Le client declenche, la facade orchestre et les sous-systemes executent.",
					List.of(
						item("client", "Client"),
						item("facade", "Facade"),
						item("subsystems", "Sous-systemes")
					),
					List.of(
						item("trigger", "Declenche la demande"),
						item("orchestrate", "Coordonne plusieurs appels"),
						item("execute", "Executent le vrai travail")
					),
					List.of(
						pair("client", "trigger"),
						pair("facade", "orchestrate"),
						pair("subsystems", "execute")
					)
				),
				singleChoice(
					"facade-q6",
					"Quel exemple illustre bien Facade ?",
					EASY,
					"Un bouton unique qui demarre audio, lumiere et securite est un exemple clair de Facade.",
					List.of(
						choice("home", "Un bouton Start qui orchestre plusieurs modules"),
						choice("flyweight", "Partager la memoire entre objets"),
						choice("state", "Changer d etat a runtime")
					),
					"home"
				),
				trueFalse(
					"facade-q7",
					"Facade peut reduire le couplage du client avec les details internes.",
					MEDIUM,
					"Oui : le client depend d une entree plus simple au lieu de connaitre chaque sous-systeme concret.",
					true
				),
				singleChoice(
					"facade-q8",
					"Facade evite surtout au client :",
					MEDIUM,
					"Le client n a plus besoin de memoriser l ordre de plusieurs appels techniques.",
					List.of(
						choice("orchestration", "Une orchestration manuelle verbeuse"),
						choice("memory", "La duplication memoire"),
						choice("events", "Les evenements pub/sub")
					),
					"orchestration"
				),
				singleChoice(
					"facade-q9",
					"Facade cache surtout :",
					HARD,
					"Le pattern masque la complexite d usage du systeme, pas forcement toute son implementation interne.",
					List.of(
						choice("complexity", "La complexite d utilisation du systeme"),
						choice("database", "La base de donnees uniquement"),
						choice("inheritance", "L heritage multiple")
					),
					"complexity"
				),
				ordering(
					"facade-q10",
					"Remets la boucle Facade dans le bon ordre.",
					HARD,
					"Le client appelle la facade, la facade orchestre, les sous-systemes executent, puis l etat global revient.",
					List.of(
						orderingItem("call", "Le client appelle la facade"),
						orderingItem("dispatch", "La facade distribue les appels"),
						orderingItem("subsystems", "Les sous-systemes executent"),
						orderingItem("result", "Le resultat global revient au client")
					),
					List.of("call", "dispatch", "subsystems", "result")
				)
			)
		);
	}
}
