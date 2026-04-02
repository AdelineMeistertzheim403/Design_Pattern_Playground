package com.designpatternplayground.backend.demo.strategy;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.springframework.stereotype.Component;

import com.designpatternplayground.backend.common.exception.InvalidPatternConfigurationException;
import com.designpatternplayground.backend.demo.strategy.domain.CardPaymentStrategy;
import com.designpatternplayground.backend.demo.strategy.domain.CryptoPaymentStrategy;
import com.designpatternplayground.backend.demo.strategy.domain.PaymentContext;
import com.designpatternplayground.backend.demo.strategy.domain.PaymentStrategy;
import com.designpatternplayground.backend.demo.strategy.domain.PaypalPaymentStrategy;
import com.designpatternplayground.backend.pattern.api.DesignPatternDemo;
import com.designpatternplayground.backend.pattern.domain.FieldType;
import com.designpatternplayground.backend.pattern.domain.PatternExecutionRequest;
import com.designpatternplayground.backend.pattern.domain.PatternExecutionResult;
import com.designpatternplayground.backend.pattern.domain.PatternField;
import com.designpatternplayground.backend.pattern.domain.PatternMetadata;
import com.designpatternplayground.backend.pattern.domain.PatternSchema;
import com.designpatternplayground.backend.pattern.domain.PatternType;
import com.designpatternplayground.backend.pattern.domain.VisualizationEdge;
import com.designpatternplayground.backend.pattern.domain.VisualizationGraph;
import com.designpatternplayground.backend.pattern.domain.VisualizationNode;

@Component
public class StrategyPatternDemo implements DesignPatternDemo {

	private static final String WITH_STRATEGY = "WITH_STRATEGY";
	private static final String WITHOUT_STRATEGY = "WITHOUT_STRATEGY";

	@Override
	public String getCode() {
		return "strategy";
	}

	@Override
	public PatternMetadata getMetadata() {
		return new PatternMetadata(
			"strategy",
			"Strategy",
			PatternType.BEHAVIORAL,
			"Permet de changer d algorithme a l execution sans modifier le contexte appelant.",
			"Choisir dynamiquement un mode de paiement tout en gardant le meme workflow.",
			"INTERMEDIATE"
		);
	}

	@Override
	public PatternSchema getSchema() {
		return new PatternSchema(List.of(
			new PatternField(
				"mode",
				"Mode",
				FieldType.SELECT,
				true,
				List.of(WITH_STRATEGY, WITHOUT_STRATEGY),
				WITH_STRATEGY
			),
			new PatternField("amount", "Montant", FieldType.NUMBER, true, null, "100"),
			new PatternField(
				"strategy",
				"Strategie de paiement",
				FieldType.SELECT,
				true,
				List.of("CARD", "PAYPAL", "CRYPTO"),
				"CARD"
			)
		));
	}

	@Override
	public PatternExecutionResult execute(PatternExecutionRequest request) {
		StrategyConfig config = toConfig(request.parameters());
		List<String> logs = new ArrayList<>();
		boolean useStrategy = WITH_STRATEGY.equals(config.mode());
		String modeLabel = useStrategy ? "Avec Strategy" : "Sans Strategy";
		PaymentStrategy strategy = resolveStrategy(config.strategy());
		String message;
		List<VisualizationNode> nodes = new ArrayList<>();
		List<VisualizationEdge> edges = new ArrayList<>();

		if (useStrategy) {
			logs.add("Creation du contexte de paiement.");
			logs.add("Selection de la strategie : " + strategy.label() + ".");

			PaymentContext context = new PaymentContext(strategy);
			logs.add("Execution du workflow de paiement avec un algorithme interchangeable.");

			message = context.execute(config.amount());
			logs.add("Resultat : " + message);

			nodes.add(new VisualizationNode("context", "PaymentContext", "context", Map.of("active", true)));
			nodes.add(new VisualizationNode("card", "Carte", "strategy", Map.of("selected", strategy.code().equals("CARD"))));
			nodes.add(new VisualizationNode("paypal", "Paypal", "strategy", Map.of("selected", strategy.code().equals("PAYPAL"))));
			nodes.add(new VisualizationNode("crypto", "Crypto", "strategy", Map.of("selected", strategy.code().equals("CRYPTO"))));
			nodes.add(new VisualizationNode("result", "Resultat", "output", Map.of("message", message)));

			edges.add(new VisualizationEdge("context", "card", "disponible"));
			edges.add(new VisualizationEdge("context", "paypal", "disponible"));
			edges.add(new VisualizationEdge("context", "crypto", "disponible"));
			edges.add(new VisualizationEdge(strategy.code().toLowerCase(Locale.ROOT), "result", "execute"));
		} else {
			logs.add("Mode sans Strategy : PaymentService contient un bloc if/else pour choisir l algorithme.");
			logs.add("Evaluation de la branche " + strategy.label() + ".");
			logs.add("Le service decide quel traitement executer selon la valeur recue.");

			message = executeWithoutStrategy(config.amount(), strategy.code());
			logs.add("Resultat : " + message);

			nodes.add(new VisualizationNode("context", "PaymentService", "context", Map.of("active", true)));
			nodes.add(new VisualizationNode("card", "if CARD", "strategy", Map.of("selected", strategy.code().equals("CARD"), "detail", "branche conditionnelle")));
			nodes.add(new VisualizationNode("paypal", "if PAYPAL", "strategy", Map.of("selected", strategy.code().equals("PAYPAL"), "detail", "branche conditionnelle")));
			nodes.add(new VisualizationNode("crypto", "if CRYPTO", "strategy", Map.of("selected", strategy.code().equals("CRYPTO"), "detail", "branche conditionnelle")));
			nodes.add(new VisualizationNode("result", "Resultat", "output", Map.of("message", message)));

			edges.add(new VisualizationEdge("context", "card", "if/else"));
			edges.add(new VisualizationEdge("context", "paypal", "if/else"));
			edges.add(new VisualizationEdge("context", "crypto", "if/else"));
			edges.add(new VisualizationEdge(strategy.code().toLowerCase(Locale.ROOT), "result", "branch"));
		}

		Map<String, Object> output = Map.of(
			"mode", useStrategy ? WITH_STRATEGY : WITHOUT_STRATEGY,
			"modeLabel", modeLabel,
			"amount", config.amount(),
			"selectedStrategy", strategy.code(),
			"selectedLabel", strategy.label(),
			"message", message
		);

		return new PatternExecutionResult(
			getCode(),
			useStrategy
				? "Strategy laisse le contexte deleguer l execution a l algorithme selectionne."
				: "Sans Strategy, le service garde les branches conditionnelles en son sein et perd en lisibilite des variantes.",
			logs,
			output,
			new VisualizationGraph(nodes, edges)
		);
	}

	private StrategyConfig toConfig(Map<String, Object> parameters) {
		if (parameters == null) {
			throw new InvalidPatternConfigurationException("Les parametres sont obligatoires.");
		}

		Object modeValue = parameters.get("mode");
		Object amountValue = parameters.get("amount");
		Object strategyValue = parameters.get("strategy");

		if (modeValue == null || amountValue == null || strategyValue == null) {
			throw new InvalidPatternConfigurationException("mode, amount et strategy sont obligatoires.");
		}

		BigDecimal amount;
		try {
			amount = new BigDecimal(amountValue.toString());
		} catch (NumberFormatException exception) {
			throw new InvalidPatternConfigurationException("amount doit etre un nombre valide.");
		}

		if (amount.signum() <= 0) {
			throw new InvalidPatternConfigurationException("amount doit etre strictement positif.");
		}

		String mode = modeValue.toString().trim().toUpperCase(Locale.ROOT);
		if (!WITH_STRATEGY.equals(mode) && !WITHOUT_STRATEGY.equals(mode)) {
			throw new InvalidPatternConfigurationException("mode doit valoir WITH_STRATEGY ou WITHOUT_STRATEGY.");
		}

		return new StrategyConfig(mode, amount, strategyValue.toString());
	}

	private PaymentStrategy resolveStrategy(String rawStrategy) {
		return switch (rawStrategy.toUpperCase(Locale.ROOT)) {
			case "CARD" -> new CardPaymentStrategy();
			case "PAYPAL" -> new PaypalPaymentStrategy();
			case "CRYPTO" -> new CryptoPaymentStrategy();
			default -> throw new InvalidPatternConfigurationException("Strategie inconnue : " + rawStrategy);
		};
	}

	private String executeWithoutStrategy(BigDecimal amount, String strategyCode) {
		return switch (strategyCode) {
			case "CARD" -> "Paiement de " + amount + " EUR effectue par carte bancaire.";
			case "PAYPAL" -> "Paiement de " + amount + " EUR effectue avec Paypal.";
			case "CRYPTO" -> "Paiement de " + amount + " EUR effectue en cryptomonnaie.";
			default -> throw new InvalidPatternConfigurationException("Strategie inconnue : " + strategyCode);
		};
	}
}
