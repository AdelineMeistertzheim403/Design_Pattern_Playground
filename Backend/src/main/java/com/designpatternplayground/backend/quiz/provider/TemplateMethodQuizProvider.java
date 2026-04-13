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
public class TemplateMethodQuizProvider implements PatternQuizProvider {

	@Override
	public String getPatternCode() {
		return "template";
	}

	@Override
	public PatternQuiz getQuiz() {
		return new PatternQuiz(
			getPatternCode(),
			"Quiz Template Method",
			"Teste ta comprehension d un algorithme stable dont certaines etapes varient.",
			75,
			"Badge valide",
			0,
			List.of(
				singleChoice(
					"template-q1",
					"Le pattern Template Method permet surtout de :",
					EASY,
					"Il fixe le squelette d un algorithme tout en laissant quelques etapes varier.",
					List.of(
						choice("skeleton", "Fixer un squelette d algorithme avec quelques etapes variables"),
						choice("clone", "Cloner un objet deja configure"),
						choice("cache", "Partager un cache global")
					),
					"skeleton"
				),
				trueFalse(
					"template-q2",
					"Dans Template Method, l ordre global des etapes est defini par la classe de base.",
					EASY,
					"Oui : la methode template garde la sequence stable.",
					true
				),
				singleChoice(
					"template-q3",
					"Template Method appartient a la famille :",
					EASY,
					"Template Method est un pattern comportemental.",
					List.of(
						choice("creational", "Creation"),
						choice("structural", "Structurel"),
						choice("behavioral", "Comportemental")
					),
					"behavioral"
				),
				singleChoice(
					"template-q4",
					"Quelle partie varie generalement selon la sous-classe ?",
					MEDIUM,
					"Les sous-classes implementent surtout les etapes specialisees ou hooks.",
					List.of(
						choice("hook", "Une etape specialisee comme execute()"),
						choice("registry", "Le registre global des patterns"),
						choice("database", "La base de donnees")
					),
					"hook"
				),
				matching(
					"template-q5",
					"Associe chaque etape au bon role dans un workflow Template Method.",
					MEDIUM,
					"Prepare met en place, Execute specialise le travail et Finalize cloture le flux.",
					List.of(
						item("prepare", "Prepare"),
						item("execute", "Execute"),
						item("finalize", "Finalize")
					),
					List.of(
						item("setup", "Met en place le contexte"),
						item("custom", "Realise l etape variable"),
						item("cleanup", "Cloture et publie l etat final")
					),
					List.of(
						pair("prepare", "setup"),
						pair("execute", "custom"),
						pair("finalize", "cleanup")
					)
				),
				singleChoice(
					"template-q6",
					"Template Method evite surtout :",
					MEDIUM,
					"Le pattern evite de recopier les memes etapes communes dans plusieurs workflows.",
					List.of(
						choice("duplication", "La duplication du workflow commun"),
						choice("events", "Les evenements pub/sub"),
						choice("memory", "La duplication memoire")
					),
					"duplication"
				),
				trueFalse(
					"template-q7",
					"Une sous-classe devrait librement changer l ordre de la methode template sans toucher la classe de base.",
					HARD,
					"Non : si l ordre change, c est justement le squelette stable qui n existe plus vraiment.",
					false
				),
				singleChoice(
					"template-q8",
					"Quel cas illustre bien Template Method ?",
					EASY,
					"Un pipeline prepare -> execute -> finalise avec un centre variable est un tres bon exemple.",
					List.of(
						choice("workflow", "Un workflow stable avec une etape centrale specialisee"),
						choice("singleton", "Un service unique global"),
						choice("adapter", "Une conversion d interface")
					),
					"workflow"
				),
				singleChoice(
					"template-q9",
					"Le coeur du pattern est la combinaison :",
					HARD,
					"Le pattern melange invariants communs et points d extension limites.",
					List.of(
						choice("fixed-plus-variation", "Squelette fixe + variations controlees"),
						choice("cache-plus-lock", "Cache + verrou global"),
						choice("observer-plus-event", "Observers + evenement")
					),
					"fixed-plus-variation"
				),
				ordering(
					"template-q10",
					"Remets la sequence Template Method dans le bon ordre.",
					HARD,
					"La preparation ouvre le workflow, execute specialise le coeur, puis finalize cloture.",
					List.of(
						orderingItem("prepare", "Preparer le contexte"),
						orderingItem("execute", "Executer l etape specialisee"),
						orderingItem("finalize", "Finaliser le workflow"),
						orderingItem("result", "Publier le resultat")
					),
					List.of("prepare", "execute", "finalize", "result")
				)
			)
		);
	}
}
