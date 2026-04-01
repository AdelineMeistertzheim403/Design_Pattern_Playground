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
public class FactoryQuizProvider implements PatternQuizProvider {

	@Override
	public String getPatternCode() {
		return "factory";
	}

	@Override
	public PatternQuiz getQuiz() {
		return new PatternQuiz(
			getPatternCode(),
			"Quiz Factory Method",
			"Valide ta comprehension de la creation centralisee et du decouplage entre le client et les produits concrets.",
			75,
			"Badge valide",
			0,
			List.of(
				singleChoice(
					"factory-q1",
					"La Factory sert a :",
					EASY,
					"La factory encapsule la creation des objets pour eviter de disperser les instanciations dans le code client.",
					List.of(
						choice("modify", "Modifier un objet"),
						choice("create", "Creer des objets"),
						choice("delete", "Supprimer des objets")
					),
					"create"
				),
				trueFalse(
					"factory-q2",
					"La Factory centralise la creation.",
					EASY,
					"C est l interet principal du pattern : un point d entree unique pour instancier les produits.",
					true
				),
				singleChoice(
					"factory-q3",
					"La Factory evite surtout :",
					MEDIUM,
					"Elle evite de multiplier les appels a new un peu partout dans le code applicatif.",
					List.of(
						choice("interfaces", "Les interfaces"),
						choice("news", "Les new disperses"),
						choice("classes", "Les classes")
					),
					"news"
				),
				singleChoice(
					"factory-q4",
					"Qui appelle la factory ?",
					EASY,
					"Le client demande une creation a la factory au lieu d instancier le produit concret lui-meme.",
					List.of(
						choice("database", "La base de donnees"),
						choice("client", "Le client"),
						choice("server", "Le serveur")
					),
					"client"
				),
				matching(
					"factory-q5",
					"Associe chaque role a sa responsabilite.",
					MEDIUM,
					"La factory cree, le produit est l objet final, et le client exprime le besoin de creation.",
					List.of(
						item("factory", "Factory"),
						item("product", "Produit"),
						item("client", "Client")
					),
					List.of(
						item("create", "Cree"),
						item("object", "Objet"),
						item("request", "Demande")
					),
					List.of(
						pair("factory", "create"),
						pair("product", "object"),
						pair("client", "request")
					)
				),
				singleChoice(
					"factory-q6",
					"Factory est un pattern :",
					EASY,
					"Factory Method appartient a la famille des patterns de creation.",
					List.of(
						choice("creational", "Creation"),
						choice("behavioral", "Comportemental"),
						choice("structural", "Structurel")
					),
					"creational"
				),
				singleChoice(
					"factory-q7",
					"La Factory retourne typiquement :",
					MEDIUM,
					"Une factory renvoie une instance prete a l emploi, souvent typée via une abstraction commune.",
					List.of(
						choice("null", "null"),
						choice("object", "Un objet"),
						choice("interface-only", "Une interface uniquement")
					),
					"object"
				),
				trueFalse(
					"factory-q8",
					"La Factory ameliore la flexibilite.",
					MEDIUM,
					"Elle permet de remplacer plus facilement le type concret cree sans casser le code client.",
					true
				),
				singleChoice(
					"factory-q9",
					"Quel exemple illustre bien Factory ?",
					EASY,
					"Choisir dynamiquement quel vehicule concret instancier est un exemple classique de factory.",
					List.of(
						choice("login", "Login"),
						choice("vehicle", "Creation de vehicules"),
						choice("logs", "Logs")
					),
					"vehicle"
				),
				singleChoice(
					"factory-q10",
					"Factory permet principalement de :",
					HARD,
					"Le gain majeur est de separer la logique de creation de la logique d utilisation.",
					List.of(
						choice("decouple", "Decoupler creation et usage"),
						choice("remove-classes", "Supprimer les classes"),
						choice("ui", "Ameliorer l UI")
					),
					"decouple"
				)
			)
		);
	}
}
