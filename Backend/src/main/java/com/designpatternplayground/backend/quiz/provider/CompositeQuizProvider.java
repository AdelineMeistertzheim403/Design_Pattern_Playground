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
public class CompositeQuizProvider implements PatternQuizProvider {

	@Override
	public String getPatternCode() {
		return "composite";
	}

	@Override
	public PatternQuiz getQuiz() {
		return new PatternQuiz(
			getPatternCode(),
			"Quiz Composite",
			"Teste ta comprehension des structures arborescentes et du traitement uniforme entre groupe et feuille.",
			75,
			"Badge valide",
			0,
			List.of(
				singleChoice(
					"composite-q1",
					"Le pattern Composite permet surtout de :",
					EASY,
					"Composite traite uniformement un objet simple et un groupe d objets.",
					List.of(
						choice("tree", "Representer une arborescence part-whole"),
						choice("clone", "Cloner un objet"),
						choice("notify", "Notifier des abonnes")
					),
					"tree"
				),
				trueFalse(
					"composite-q2",
					"Une feuille et un composite peuvent exposer le meme contrat public.",
					EASY,
					"Oui : c est meme le coeur du pattern, pour que le client traite les deux de facon uniforme.",
					true
				),
				singleChoice(
					"composite-q3",
					"Composite appartient a la famille :",
					EASY,
					"Composite est un pattern structurel.",
					List.of(
						choice("creational", "Creation"),
						choice("structural", "Structurel"),
						choice("behavioral", "Comportemental")
					),
					"structural"
				),
				singleChoice(
					"composite-q4",
					"Un composite represente en general :",
					MEDIUM,
					"Le composite agrege des enfants et peut deleguer la meme operation a tous ses descendants.",
					List.of(
						choice("group", "Un groupe qui contient d autres composants"),
						choice("leaf", "Un element terminal sans enfants"),
						choice("db", "La base de donnees")
					),
					"group"
				),
				matching(
					"composite-q5",
					"Associe chaque role Composite a sa responsabilite.",
					MEDIUM,
					"Component definit le contrat, Composite contient des enfants, Leaf termine la branche.",
					List.of(
						item("component", "Component"),
						item("composite", "Composite"),
						item("leaf", "Leaf")
					),
					List.of(
						item("contract", "Contrat commun"),
						item("children", "Contient des enfants"),
						item("terminal", "N a pas d enfants")
					),
					List.of(
						pair("component", "contract"),
						pair("composite", "children"),
						pair("leaf", "terminal")
					)
				),
				singleChoice(
					"composite-q6",
					"Quel exemple illustre bien Composite ?",
					EASY,
					"Un arbre de dossiers et fichiers est un exemple canonique du pattern Composite.",
					List.of(
						choice("filesystem", "Un systeme de dossiers et fichiers"),
						choice("payment", "Un mode de paiement"),
						choice("logger", "Un logger global")
					),
					"filesystem"
				),
				trueFalse(
					"composite-q7",
					"Une feuille possede en general d autres enfants.",
					EASY,
					"Non : une leaf marque le bout d une branche et ne contient pas d enfants.",
					false
				),
				singleChoice(
					"composite-q8",
					"Composite aide surtout a :",
					MEDIUM,
					"Le pattern simplifie les parcours et les operations recursives sur tout un arbre.",
					List.of(
						choice("recursion", "Appliquer une operation recursive sur tout un arbre"),
						choice("memory", "Partager la memoire"),
						choice("events", "Diffuser des notifications")
					),
					"recursion"
				),
				singleChoice(
					"composite-q9",
					"Le client depend idealement de :",
					HARD,
					"Le client parle a l abstraction Component et ignore s il manipule une feuille ou un composite.",
					List.of(
						choice("component", "L abstraction Component"),
						choice("leaf", "La classe Leaf concrete"),
						choice("folder", "La classe Composite concrete")
					),
					"component"
				),
				ordering(
					"composite-q10",
					"Remets la boucle Composite dans le bon ordre.",
					HARD,
					"Le client appelle le component, le composite relaie aux enfants, les feuilles executent, puis le resultat remonte.",
					List.of(
						orderingItem("call", "Le client appelle le contrat Component"),
						orderingItem("delegate", "Le Composite relaie l operation aux enfants"),
						orderingItem("leaf", "Les feuilles executent leur partie"),
						orderingItem("return", "Le resultat remonte dans l arbre")
					),
					List.of("call", "delegate", "leaf", "return")
				)
			)
		);
	}
}
