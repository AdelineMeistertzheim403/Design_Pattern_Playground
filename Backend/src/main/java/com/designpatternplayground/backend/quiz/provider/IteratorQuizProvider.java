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
public class IteratorQuizProvider implements PatternQuizProvider {

	@Override
	public String getPatternCode() {
		return "iterator";
	}

	@Override
	public PatternQuiz getQuiz() {
		return new PatternQuiz(
			getPatternCode(),
			"Quiz Iterator",
			"Teste ta comprehension du parcours sequentiel cache derriere next() et previous().",
			75,
			"Badge valide",
			0,
			List.of(
				singleChoice(
					"iterator-q1",
					"Le pattern Iterator permet surtout de :",
					EASY,
					"Iterator fournit un parcours uniforme sans exposer la structure interne.",
					List.of(
						choice("traverse", "Parcourir une collection sans exposer sa structure"),
						choice("decorate", "Empiler des comportements"),
						choice("clone", "Cloner un objet")
					),
					"traverse"
				),
				trueFalse(
					"iterator-q2",
					"Iterator appartient aux patterns comportementaux.",
					EASY,
					"Oui : il traite la maniere de parcourir les elements.",
					true
				),
				singleChoice(
					"iterator-q3",
					"Le client devrait idealement connaitre :",
					MEDIUM,
					"Le client manipule next() / hasNext() plutot que la representation concrete de la collection.",
					List.of(
						choice("cursor", "Le contrat de parcours"),
						choice("storage", "Le tableau ou l arbre concret en detail"),
						choice("sql", "La requete SQL brute")
					),
					"cursor"
				),
				singleChoice(
					"iterator-q4",
					"Quel benefice est typique d Iterator ?",
					EASY,
					"Le parcours reste stable meme si la collection change de structure interne.",
					List.of(
						choice("decouple", "Decoupler le parcours de la structure"),
						choice("single", "Garantir une instance unique"),
						choice("share", "Partager la memoire")
					),
					"decouple"
				),
				matching(
					"iterator-q5",
					"Associe chaque role Iterator a sa responsabilite.",
					MEDIUM,
					"Le client demande, l iterator avance et la collection fournit les elements.",
					List.of(
						item("client", "Client"),
						item("iterator", "Iterator"),
						item("collection", "Collection")
					),
					List.of(
						item("ask", "Demande next / previous"),
						item("move", "Deplace le curseur"),
						item("store", "Contient les elements")
					),
					List.of(
						pair("client", "ask"),
						pair("iterator", "move"),
						pair("collection", "store")
					)
				),
				singleChoice(
					"iterator-q6",
					"Un iterator bidirectionnel ajoute surtout :",
					MEDIUM,
					"Il ajoute previous() en plus du parcours avant.",
					List.of(
						choice("previous", "La navigation previous()"),
						choice("clone", "Le clonage profond"),
						choice("notify", "Les notifications d evenement")
					),
					"previous"
				),
				trueFalse(
					"iterator-q7",
					"Sans Iterator, la logique de navigation a tendance a fuir dans le client.",
					MEDIUM,
					"Oui : index, bornes et retour arriere finissent dans le code appelant.",
					true
				),
				singleChoice(
					"iterator-q8",
					"Quel cas illustre bien Iterator ?",
					EASY,
					"Un explorateur next / previous sur une liste ou un arbre aplati illustre tres bien Iterator.",
					List.of(
						choice("explorer", "Un Traversal Explorer avec curseur"),
						choice("powerup", "Des power-ups empiles"),
						choice("facade", "Un bouton Start unique")
					),
					"explorer"
				),
				singleChoice(
					"iterator-q9",
					"Iterator masque principalement :",
					HARD,
					"Il masque la representation et le mecanisme concret de parcours.",
					List.of(
						choice("representation", "La representation et le mecanisme de parcours"),
						choice("database", "La base de donnees complete"),
						choice("ui", "Le style CSS")
					),
					"representation"
				),
				ordering(
					"iterator-q10",
					"Remets le parcours Iterator dans le bon ordre.",
					HARD,
					"On verifie hasNext, on lit next, on deplace le curseur puis on traite l element courant.",
					List.of(
						orderingItem("check", "Verifier si un element est disponible"),
						orderingItem("next", "Appeler next()"),
						orderingItem("move", "Deplacer le curseur"),
						orderingItem("use", "Utiliser l element courant")
					),
					List.of("check", "next", "move", "use")
				)
			)
		);
	}
}
