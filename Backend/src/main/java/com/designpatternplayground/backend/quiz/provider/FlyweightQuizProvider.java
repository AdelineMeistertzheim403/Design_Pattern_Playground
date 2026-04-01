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
public class FlyweightQuizProvider implements PatternQuizProvider {

	@Override
	public String getPatternCode() {
		return "flyweight";
	}

	@Override
	public PatternQuiz getQuiz() {
		return new PatternQuiz(
			getPatternCode(),
			"Quiz Flyweight",
			"Teste ta comprehension du partage d etat, de la reduction du nombre d instances et des cas d usage a grande echelle.",
			75,
			"Badge valide",
			0,
			List.of(
				singleChoice(
					"flyweight-q1",
					"Quel est le but principal du pattern Flyweight ?",
					EASY,
					"Flyweight partage l etat intrinseque entre de nombreux objets pour reduire la memoire.",
					List.of(
						choice("simplify", "Simplifier le code"),
						choice("memory", "Reduire la memoire en partageant des donnees"),
						choice("cpu", "Ameliorer les performances CPU")
					),
					"memory"
				),
				trueFalse(
					"flyweight-q2",
					"Le Flyweight cree plus d objets pour ameliorer les performances.",
					EASY,
					"Au contraire, il vise a reduire le nombre d instances lourdes.",
					false
				),
				singleChoice(
					"flyweight-q3",
					"Le Flyweight repose principalement sur :",
					MEDIUM,
					"Le coeur du pattern est le partage d etat intrinseque entre objets similaires.",
					List.of(
						choice("inheritance", "L heritage"),
						choice("interfaces", "Les interfaces uniquement"),
						choice("shared-state", "Le partage d etat")
					),
					"shared-state"
				),
				matching(
					"flyweight-q4",
					"Associe chaque type d etat a sa definition.",
					MEDIUM,
					"L etat intrinseque est partage, l etat extrinseque reste specifique a chaque objet utilise.",
					List.of(
						item("intrinsic", "Intrinsic state"),
						item("extrinsic", "Extrinsic state")
					),
					List.of(
						item("shared", "Partage"),
						item("specific", "Specifique a l objet")
					),
					List.of(
						pair("intrinsic", "shared"),
						pair("extrinsic", "specific")
					)
				),
				singleChoice(
					"flyweight-q5",
					"Quel cas est ideal pour Flyweight ?",
					EASY,
					"Les systemes de particules ou de tuiles repetitives sont des cas typiques avec beaucoup d objets similaires.",
					List.of(
						choice("users", "Gestion d utilisateurs"),
						choice("particles", "Systeme de particules"),
						choice("auth", "Authentification")
					),
					"particles"
				),
				singleChoice(
					"flyweight-q6",
					"Le Flyweight permet de :",
					MEDIUM,
					"Il mutualise les objets partages pour eviter de re-instancier les memes donnees lourdes.",
					List.of(
						choice("reduce", "Reduire le nombre d instances"),
						choice("complexify", "Augmenter la complexite volontairement"),
						choice("remove-classes", "Supprimer les classes")
					),
					"reduce"
				),
				trueFalse(
					"flyweight-q7",
					"Le Flyweight est utile quand on a beaucoup d objets similaires.",
					EASY,
					"Plus les objets sont nombreux et similaires, plus le gain memoire peut etre fort.",
					true
				),
				singleChoice(
					"flyweight-q8",
					"Qui gere souvent les instances Flyweight ?",
					HARD,
					"Une factory ou un cache dedie gere en general la reutilisation des flyweights.",
					List.of(
						choice("client", "Le client directement"),
						choice("factory", "Une factory"),
						choice("controller", "Le controleur")
					),
					"factory"
				),
				singleChoice(
					"flyweight-q9",
					"Sans Flyweight, on obtient souvent :",
					MEDIUM,
					"Sans mutualisation, chaque objet garde sa propre copie des donnees lourdes et la memoire explose.",
					List.of(
						choice("few", "Trop peu d objets"),
						choice("memory", "Trop d instances en memoire"),
						choice("logic", "Pas assez de logique")
					),
					"memory"
				),
				singleChoice(
					"flyweight-q10",
					"Le Flyweight separe surtout :",
					HARD,
					"La separation cle du pattern est entre etat intrinseque partage et etat extrinseque fourni a l usage.",
					List.of(
						choice("state", "Etat interne / externe"),
						choice("logic", "Logique / donnees"),
						choice("contract", "Interface / implementation")
					),
					"state"
				)
			)
		);
	}
}
