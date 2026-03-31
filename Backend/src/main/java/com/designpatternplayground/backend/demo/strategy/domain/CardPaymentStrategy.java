package com.designpatternplayground.backend.demo.strategy.domain;

import java.math.BigDecimal;

public class CardPaymentStrategy implements PaymentStrategy {

	@Override
	public String code() {
		return "CARD";
	}

	@Override
	public String label() {
		return "Carte";
	}

	@Override
	public String pay(BigDecimal amount) {
		return "Paiement de " + amount + " EUR effectue par carte bancaire.";
	}
}
