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
public class AdapterQuizProvider implements PatternQuizProvider {

	@Override
	public String getPatternCode() {
		return "adapter";
	}

	@Override
	public PatternQuiz getQuiz() {
		return new PatternQuiz(
			getPatternCode(),
			"Quiz Adapter",
			"Teste ta comprehension des interfaces incompatibles, du role Target / Adapter / Adaptee et de la transformation d un protocole vers un autre.",
			75,
			"Badge valide",
			0,
			List.of(
				singleChoice(
					"adapter-q1",
					"Le pattern Adapter permet surtout de :",
					EASY,
					"Adapter traduit une interface existante vers le contrat attendu par le client.",
					List.of(
						choice("create", "Creer plus d objets"),
						choice("translate", "Faire collaborer des interfaces incompatibles"),
						choice("share", "Partager la memoire")
					),
					"translate"
				),
				trueFalse(
					"adapter-q2",
					"Adapter oblige a modifier la classe legacy d origine.",
					EASY,
					"Non : le but est justement de garder l adaptee intacte et de placer la traduction dans un objet intermediaire.",
					false
				),
				singleChoice(
					"adapter-q3",
					"Adapter appartient a la famille :",
					EASY,
					"Adapter est un pattern structurel.",
					List.of(
						choice("creational", "Creation"),
						choice("structural", "Structurel"),
						choice("behavioral", "Comportemental")
					),
					"structural"
				),
				singleChoice(
					"adapter-q4",
					"L adaptee represente en general :",
					MEDIUM,
					"L adaptee est le composant legacy ou externe qui expose une interface que le client ne peut pas consommer directement.",
					List.of(
						choice("legacy", "Le composant existant incompatible"),
						choice("client", "Le client final"),
						choice("database", "La base de donnees")
					),
					"legacy"
				),
				matching(
					"adapter-q5",
					"Associe chaque role a sa responsabilite.",
					MEDIUM,
					"Le Target est le contrat attendu, l Adapter traduit, l Adaptee reste le composant existant.",
					List.of(
						item("target", "Target"),
						item("adapter", "Adapter"),
						item("adaptee", "Adaptee")
					),
					List.of(
						item("contract", "Contrat attendu par le client"),
						item("translate", "Traduit l appel vers le bon format"),
						item("legacy", "Composant existant incompatible")
					),
					List.of(
						pair("target", "contract"),
						pair("adapter", "translate"),
						pair("adaptee", "legacy")
					)
				),
				singleChoice(
					"adapter-q6",
					"Quel exemple illustre bien Adapter ?",
					EASY,
					"Connecter une source VGA a un ecran HDMI ou convertir une trame serie vers une API REST est un cas classique.",
					List.of(
						choice("plug", "Relier un systeme VGA a une cible HDMI"),
						choice("entity", "Mapper une entite JPA"),
						choice("quiz", "Afficher un quiz")
					),
					"plug"
				),
				trueFalse(
					"adapter-q7",
					"Adapter utilise souvent la composition pour deleguer vers l adaptee.",
					MEDIUM,
					"Oui : l Adapter wrappe souvent l adaptee et traduit les appels vers son interface specifique.",
					true
				),
				singleChoice(
					"adapter-q8",
					"Quel probleme Adapter aide-t-il a eviter ?",
					MEDIUM,
					"Il permet d integrer un composant legacy sans devoir le reecrire totalement pour coller a un nouveau contrat.",
					List.of(
						choice("rewrite", "La reecriture complete d un composant legacy"),
						choice("memory", "La duplication memoire"),
						choice("observer", "La diffusion d evenements")
					),
					"rewrite"
				),
				singleChoice(
					"adapter-q9",
					"Le client depend idealement de :",
					HARD,
					"Le client parle au contrat Target et ignore les details de l adaptee concrete.",
					List.of(
						choice("target", "L interface Target"),
						choice("adaptee", "La classe legacy concrete"),
						choice("database", "La base de donnees")
					),
					"target"
				),
				ordering(
					"adapter-q10",
					"Remets la boucle Adapter dans le bon ordre.",
					HARD,
					"Le client appelle le contrat Target, l Adapter traduit, l Adaptee fait le travail, puis le resultat revient dans le format attendu.",
					List.of(
						orderingItem("call", "Le client appelle le contrat Target"),
						orderingItem("translate", "L Adapter convertit la requete"),
						orderingItem("execute", "L Adaptee traite avec son interface native"),
						orderingItem("return", "Le resultat revient dans le format attendu")
					),
					List.of("call", "translate", "execute", "return")
				)
			)
		);
	}
}
