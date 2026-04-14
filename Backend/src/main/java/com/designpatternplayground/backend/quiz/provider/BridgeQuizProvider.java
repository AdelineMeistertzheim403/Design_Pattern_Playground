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
public class BridgeQuizProvider implements PatternQuizProvider {

	@Override
	public String getPatternCode() {
		return "bridge";
	}

	@Override
	public PatternQuiz getQuiz() {
		return new PatternQuiz(
			getPatternCode(),
			"Quiz Bridge",
			"Teste ta comprehension de la separation abstraction / implementation.",
			75,
			"Badge valide",
			0,
			List.of(
				singleChoice(
					"bridge-q1",
					"Le pattern Bridge permet surtout de :",
					EASY,
					"Bridge separe abstraction et implementation pour les faire varier independamment.",
					List.of(
						choice("separate", "Separer abstraction et implementation"),
						choice("notify", "Notifier plusieurs observers"),
						choice("clone", "Cloner un objet")
					),
					"separate"
				),
				trueFalse(
					"bridge-q2",
					"Bridge appartient aux patterns structurels.",
					EASY,
					"Oui : il reorganise les relations entre abstraction et implementation.",
					true
				),
				singleChoice(
					"bridge-q3",
					"Dans l exemple Shape + RenderEngine, Shape represente :",
					EASY,
					"Shape est l abstraction qui delegue le detail du rendu.",
					List.of(
						choice("abstraction", "L abstraction"),
						choice("implementation", "L implementation concrete"),
						choice("caretaker", "Le caretaker")
					),
					"abstraction"
				),
				singleChoice(
					"bridge-q4",
					"Bridge evite surtout :",
					MEDIUM,
					"Il evite l explosion de sous-classes quand deux dimensions varient en meme temps.",
					List.of(
						choice("explosion", "L explosion de sous-classes concretes"),
						choice("memory", "Le partage memoire"),
						choice("undo", "La perte de snapshots")
					),
					"explosion"
				),
				matching(
					"bridge-q5",
					"Associe chaque element du pattern Bridge a son role.",
					MEDIUM,
					"Le client appelle, l abstraction delegue et l implementation rend concretement.",
					List.of(
						item("client", "Client"),
						item("abstraction", "Abstraction"),
						item("implementation", "Implementation")
					),
					List.of(
						item("call", "Declenche render()"),
						item("delegate", "Delegue vers le moteur"),
						item("draw", "Fournit le rendu concret")
					),
					List.of(
						pair("client", "call"),
						pair("abstraction", "delegate"),
						pair("implementation", "draw")
					)
				),
				singleChoice(
					"bridge-q6",
					"Quel duo illustre bien Bridge ?",
					EASY,
					"Shape + RenderEngine est l exemple classique.",
					List.of(
						choice("shape-engine", "Shape + RenderEngine"),
						choice("subject-observer", "Subject + Observer"),
						choice("factory-product", "Factory + Product")
					),
					"shape-engine"
				),
				trueFalse(
					"bridge-q7",
					"On peut changer de moteur concret sans reecrire l abstraction principale.",
					MEDIUM,
					"Oui : c est justement l interet du decouplage Bridge.",
					true
				),
				singleChoice(
					"bridge-q8",
					"Quand Bridge devient-il pertinent ?",
					MEDIUM,
					"Quand deux dimensions evoluent separement, par exemple plusieurs formes et plusieurs moteurs.",
					List.of(
						choice("two-dimensions", "Quand forme et implementation evoluent separement"),
						choice("single-instance", "Quand on veut une seule instance globale"),
						choice("simple-list", "Quand on parcourt une liste")
					),
					"two-dimensions"
				),
				singleChoice(
					"bridge-q9",
					"Sans Bridge, on tombe souvent sur :",
					HARD,
					"Les combinaisons deviennent des sous-classes concretes rigides.",
					List.of(
						choice("combo", "Des classes du type CircleGlowShape ou TrianglePixelShape"),
						choice("cache", "Un cache partage"),
						choice("pubsub", "Une diffusion d evenements")
					),
					"combo"
				),
				ordering(
					"bridge-q10",
					"Remets le flux Bridge dans le bon ordre.",
					HARD,
					"Le client appelle l abstraction, l abstraction delegue, puis l implementation execute le rendu concret.",
					List.of(
						orderingItem("client", "Le client demande un rendu"),
						orderingItem("abstraction", "L abstraction prepare l operation"),
						orderingItem("delegate", "L abstraction delegue vers l implementation"),
						orderingItem("implementation", "Le moteur concret dessine")
					),
					List.of("client", "abstraction", "delegate", "implementation")
				)
			)
		);
	}
}
