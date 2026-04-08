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
public class PrototypeQuizProvider implements PatternQuizProvider {

	@Override
	public String getPatternCode() {
		return "prototype";
	}

	@Override
	public PatternQuiz getQuiz() {
		return new PatternQuiz(
			getPatternCode(),
			"Quiz Prototype",
			"Valide ta comprehension du clonage, de la copie superficielle et de la copie profonde.",
			75,
			"Badge valide",
			0,
			List.of(
				singleChoice(
					"prototype-q1",
					"Le pattern Prototype permet surtout de :",
					EASY,
					"Prototype sert a dupliquer rapidement un objet deja configure.",
					List.of(
						choice("clone", "Cloner un objet existant"),
						choice("notify", "Notifier des abonnes"),
						choice("share", "Partager la memoire d affichage")
					),
					"clone"
				),
				trueFalse(
					"prototype-q2",
					"Prototype appartient a la famille des patterns de creation.",
					EASY,
					"Oui : il cree de nouveaux objets a partir d une instance source deja configuree.",
					true
				),
				singleChoice(
					"prototype-q3",
					"Dans une copie superficielle, le risque principal concerne :",
					MEDIUM,
					"Une copie superficielle peut conserver les memes references imbriquees entre plusieurs clones.",
					List.of(
						choice("nested", "Les references imbriquees partagees"),
						choice("syntax", "La syntaxe du constructeur"),
						choice("network", "Le reseau")
					),
					"nested"
				),
				singleChoice(
					"prototype-q4",
					"Une copie profonde signifie que :",
					MEDIUM,
					"Les objets imbriques sont aussi dupliques, donc chaque clone porte son propre etat.",
					List.of(
						choice("same", "Tous les clones gardent la meme reference imbriquee"),
						choice("deep", "Les objets imbriques sont dupliques eux aussi"),
						choice("none", "Aucun clone n est cree")
					),
					"deep"
				),
				matching(
					"prototype-q5",
					"Associe chaque notion Prototype a son effet.",
					MEDIUM,
					"Le prototype source sert de modele, la shallow copy partage des references, la deep copy les isole.",
					List.of(
						item("source", "Prototype source"),
						item("shallow", "Copie superficielle"),
						item("deep", "Copie profonde")
					),
					List.of(
						item("model", "Objet modele deja configure"),
						item("shared", "References imbriquees partagees"),
						item("isolated", "Etat imbrique isole")
					),
					List.of(
						pair("source", "model"),
						pair("shallow", "shared"),
						pair("deep", "isolated")
					)
				),
				singleChoice(
					"prototype-q6",
					"Quel cas colle bien a Prototype ?",
					EASY,
					"Cloner rapidement des ennemis, des drones ou des cartes deja configurees est un bon usage de Prototype.",
					List.of(
						choice("clones", "Cloner des drones deja equipes"),
						choice("events", "Diffuser des notifications"),
						choice("commands", "Historiser undo / redo")
					),
					"clones"
				),
				trueFalse(
					"prototype-q7",
					"Modifier un objet imbrique partage peut impacter plusieurs clones.",
					EASY,
					"C est exactement le piege montre par la copie superficielle.",
					true
				),
				singleChoice(
					"prototype-q8",
					"Le principal interet de Prototype est de :",
					MEDIUM,
					"On evite de reconfigurer l objet depuis zero a chaque creation.",
					List.of(
						choice("repeat", "Repartir de zero a chaque fois"),
						choice("reuse", "Reutiliser un objet modele deja configure"),
						choice("switch", "Remplacer des switch")
					),
					"reuse"
				),
				singleChoice(
					"prototype-q9",
					"Sans copie profonde, une mutation locale peut :",
					HARD,
					"Si les references restent partagees, une mutation locale fuit vers les autres clones.",
					List.of(
						choice("leak", "Se propager a d autres clones"),
						choice("compile", "Casser la compilation"),
						choice("none", "Rester toujours isolee")
					),
					"leak"
				),
				ordering(
					"prototype-q10",
					"Remets le flux Prototype dans le bon ordre.",
					HARD,
					"On prepare un modele, on clone, on ajuste un clone, puis on observe si l etat reste isole ou non.",
					List.of(
						orderingItem("seed", "Configurer le prototype source"),
						orderingItem("clone", "Dupliquer plusieurs clones"),
						orderingItem("mutate", "Modifier un clone cible"),
						orderingItem("observe", "Observer isolation ou propagation")
					),
					List.of("seed", "clone", "mutate", "observe")
				)
			)
		);
	}
}
