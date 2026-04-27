package com.designpatternplayground.backend.quiz.provider;

import static com.designpatternplayground.backend.quiz.domain.QuestionDifficulty.EASY;
import static com.designpatternplayground.backend.quiz.domain.QuestionDifficulty.HARD;
import static com.designpatternplayground.backend.quiz.domain.QuestionDifficulty.MEDIUM;
import static com.designpatternplayground.backend.quiz.domain.QuizQuestions.choice;
import static com.designpatternplayground.backend.quiz.domain.QuizQuestions.singleChoice;
import static com.designpatternplayground.backend.quiz.domain.QuizQuestions.trueFalse;

import java.util.List;

import org.springframework.stereotype.Component;

import com.designpatternplayground.backend.quiz.api.PatternQuizProvider;
import com.designpatternplayground.backend.quiz.domain.PatternQuiz;

@Component
public class SingletonQuizProvider implements PatternQuizProvider {

	@Override
	public String getPatternCode() {
		return "singleton";
	}

	@Override
	public PatternQuiz getQuiz() {
		return new PatternQuiz(
			getPatternCode(),
			"Quiz Singleton",
			"Valide le principe d instance unique, ses cas d usage utiles et ses limites en conception.",
			75,
			"Badge valide",
			0,
			List.of(
				singleChoice(
					"singleton-q1",
					"Quel est le but du Singleton ?",
					EASY,
					"Singleton garantit qu un seul objet controle un service global donne.",
					List.of(
						choice("many", "Creer plusieurs objets"),
						choice("single", "Garantir une seule instance"),
						choice("perf", "Ameliorer les performances")
					),
					"single"
				),
				trueFalse(
					"singleton-q2",
					"Un Singleton peut avoir plusieurs instances.",
					EASY,
					"Par definition, le pattern vise a limiter l existence a une seule instance accessible globalement.",
					false
				),
				singleChoice(
					"singleton-q3",
					"Un Singleton est souvent utilise pour :",
					EASY,
					"Logger, configuration globale ou gestionnaire central sont des usages classiques.",
					List.of(
						choice("logger", "Logger"),
						choice("dto", "DTO"),
						choice("entity", "Entite metier")
					),
					"logger"
				),
				singleChoice(
					"singleton-q4",
					"Quel est un probleme classique du Singleton ?",
					MEDIUM,
					"Le pattern peut masquer des dependances globales et compliquer les tests unitaires.",
					List.of(
						choice("simple", "Trop simple"),
						choice("testing", "Difficulte de test"),
						choice("fast", "Trop rapide")
					),
					"testing"
				),
				trueFalse(
					"singleton-q5",
					"Le Singleton permet de partager un etat global.",
					EASY,
					"Tous les clients recuperent la meme instance et voient le meme etat central.",
					true
				),
				singleChoice(
					"singleton-q6",
					"Le Singleton utilise souvent :",
					MEDIUM,
					"Une instance statique interne est le mecanisme le plus classique pour porter l unicite.",
					List.of(
						choice("factory", "Une factory obligatoire"),
						choice("static-instance", "Une instance statique"),
						choice("interface", "Une interface")
					),
					"static-instance"
				),
				singleChoice(
					"singleton-q7",
					"Sans Singleton, on a souvent :",
					EASY,
					"Chaque client cree son propre objet et on perd la coherence globale.",
					List.of(
						choice("many", "Plusieurs instances"),
						choice("single", "Une seule instance"),
						choice("none", "Aucune instance")
					),
					"many"
				),
				singleChoice(
					"singleton-q8",
					"Singleton est un pattern :",
					EASY,
					"Singleton fait partie des patterns de creation.",
					List.of(
						choice("creational", "Creation"),
						choice("structural", "Structurel"),
						choice("behavioral", "Comportemental")
					),
					"creational"
				),
				singleChoice(
					"singleton-q9",
					"Quel est un mauvais usage du Singleton ?",
					HARD,
					"Le pattern ne doit pas servir a cacher une logique metier complexe derriere un etat global.",
					List.of(
						choice("logger", "Logger"),
						choice("config", "Config globale"),
						choice("business", "Logique metier complexe")
					),
					"business"
				),
				trueFalse(
					"singleton-q10",
					"Le Singleton peut cacher des dependances.",
					HARD,
					"Un acces global facile peut masquer la dependance reelle d une classe et nuire a la testabilite.",
					true
				)
			)
		);
	}
}
