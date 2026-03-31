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

		logs.add("Creation du contexte de paiement.");
		PaymentStrategy strategy = resolveStrategy(config.strategy());
		logs.add("Selection de la strategie : " + strategy.label() + ".");

		PaymentContext context = new PaymentContext(strategy);
		logs.add("Execution du workflow de paiement avec un algorithme interchangeable.");

		String message = context.execute(config.amount());
		logs.add("Resultat : " + message);

		Map<String, Object> output = Map.of(
			"amount", config.amount(),
			"selectedStrategy", strategy.code(),
			"selectedLabel", strategy.label(),
			"message", message
		);

		VisualizationGraph visualization = new VisualizationGraph(
			List.of(
				new VisualizationNode("context", "PaymentContext", "context", Map.of("active", true)),
				new VisualizationNode("card", "Carte", "strategy", Map.of("selected", strategy.code().equals("CARD"))),
				new VisualizationNode("paypal", "Paypal", "strategy", Map.of("selected", strategy.code().equals("PAYPAL"))),
				new VisualizationNode("crypto", "Crypto", "strategy", Map.of("selected", strategy.code().equals("CRYPTO"))),
				new VisualizationNode("result", "Resultat", "output", Map.of("message", message))
			),
			List.of(
				new VisualizationEdge("context", "card", "disponible"),
				new VisualizationEdge("context", "paypal", "disponible"),
				new VisualizationEdge("context", "crypto", "disponible"),
				new VisualizationEdge(strategy.code().toLowerCase(Locale.ROOT), "result", "execute")
			)
		);

		return new PatternExecutionResult(
			getCode(),
			"Strategy laisse le contexte deleguer l execution a l algorithme selectionne.",
			logs,
			output,
			visualization
		);
	}

	private StrategyConfig toConfig(Map<String, Object> parameters) {
		if (parameters == null) {
			throw new InvalidPatternConfigurationException("Les parametres sont obligatoires.");
		}

		Object amountValue = parameters.get("amount");
		Object strategyValue = parameters.get("strategy");

		if (amountValue == null || strategyValue == null) {
			throw new InvalidPatternConfigurationException("amount et strategy sont obligatoires.");
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

		return new StrategyConfig(amount, strategyValue.toString());
	}

	private PaymentStrategy resolveStrategy(String rawStrategy) {
		return switch (rawStrategy.toUpperCase(Locale.ROOT)) {
			case "CARD" -> new CardPaymentStrategy();
			case "PAYPAL" -> new PaypalPaymentStrategy();
			case "CRYPTO" -> new CryptoPaymentStrategy();
			default -> throw new InvalidPatternConfigurationException("Strategie inconnue : " + rawStrategy);
		};
	}
}
