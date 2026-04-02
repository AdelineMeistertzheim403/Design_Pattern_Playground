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
public class DecoratorQuizProvider implements PatternQuizProvider {

	@Override
	public String getPatternCode() {
		return "decorator";
	}

	@Override
	public PatternQuiz getQuiz() {
		return new PatternQuiz(
			getPatternCode(),
			"Quiz Decorator",
			"Valide ta comprehension de l empilement de comportements, du wrapping et de la flexibilite apportee par la composition.",
			75,
			"Badge valide",
			0,
			List.of(
				singleChoice(
					"decorator-q1",
					"Le pattern Decorator permet :",
					EASY,
					"Decorator ajoute des responsabilites autour d un objet existant sans modifier sa classe concrete.",
					List.of(
						choice("create", "Creer des objets"),
						choice("share", "Partager la memoire"),
						choice("behavior", "Ajouter des comportements dynamiquement")
					),
					"behavior"
				),
				trueFalse(
					"decorator-q2",
					"Decorator modifie directement la classe d origine.",
					EASY,
					"Le pattern evite justement de toucher a la classe d origine en passant par des wrappers successifs.",
					false
				),
				singleChoice(
					"decorator-q3",
					"Decorator est un pattern :",
					EASY,
					"Decorator appartient a la famille des patterns structurels.",
					List.of(
						choice("creational", "Creation"),
						choice("behavioral", "Comportemental"),
						choice("structural", "Structurel")
					),
					"structural"
				),
				singleChoice(
					"decorator-q4",
					"Le Decorator :",
					MEDIUM,
					"Il enveloppe l objet d origine pour enrichir son comportement sans le remplacer conceptuellement.",
					List.of(
						choice("replace", "Remplace l objet"),
						choice("wrap", "Wrap l objet"),
						choice("delete", "Le supprime")
					),
					"wrap"
				),
				matching(
					"decorator-q5",
					"Associe chaque role Decorator a sa responsabilite.",
					MEDIUM,
					"Le component est le contrat commun, le decorator ajoute un comportement, et le concrete decorator en est l implementation.",
					List.of(
						item("decorator", "Decorator"),
						item("component", "Component"),
						item("concrete", "ConcreteDecorator")
					),
					List.of(
						item("behavior", "Ajoute comportement"),
						item("base", "Objet de base"),
						item("implementation", "Implementation concrete")
					),
					List.of(
						pair("decorator", "behavior"),
						pair("component", "base"),
						pair("concrete", "implementation")
					)
				),
				singleChoice(
					"decorator-q6",
					"Decorator evite surtout :",
					MEDIUM,
					"Le pattern evite de multiplier des combinaisons de classes du type ObjetFeuBouclierVitesse.",
					List.of(
						choice("interfaces", "Les interfaces"),
						choice("classes", "Les classes"),
						choice("explosion", "L explosion de classes")
					),
					"explosion"
				),
				trueFalse(
					"decorator-q7",
					"On peut empiler plusieurs decorators.",
					EASY,
					"C est meme le coeur de la demonstration : chaque wrapper enrichit l objet deja decore.",
					true
				),
				singleChoice(
					"decorator-q8",
					"Quel exemple illustre bien Decorator ?",
					EASY,
					"Des effets de personnage ou un cafe personnalisable sont des exemples classiques de decoration cumulative.",
					List.of(
						choice("database", "Base de donnees"),
						choice("effects", "Effets de personnage"),
						choice("login", "Login")
					),
					"effects"
				),
				singleChoice(
					"decorator-q9",
					"Decorator utilise principalement :",
					HARD,
					"Le mecanisme cle est la composition : chaque decorator contient une reference vers le component qu il enveloppe.",
					List.of(
						choice("inheritance", "L heritage uniquement"),
						choice("composition", "La composition"),
						choice("static", "Du static")
					),
					"composition"
				),
				singleChoice(
					"decorator-q10",
					"Decorator apporte surtout :",
					HARD,
					"Le pattern favorise la flexibilite en combinant dynamiquement plusieurs effets sans rigidifier le modele.",
					List.of(
						choice("flexibility", "Flexibilite"),
						choice("rigidity", "Rigidite"),
						choice("coupling", "Dependance forte")
					),
					"flexibility"
				)
			)
		);
	}
}
