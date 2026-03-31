package com.designpatternplayground.backend.demo.strategy.domain;

import java.math.BigDecimal;

public class PaypalPaymentStrategy implements PaymentStrategy {

	@Override
	public String code() {
		return "PAYPAL";
	}

	@Override
	public String label() {
		return "Paypal";
	}

	@Override
	public String pay(BigDecimal amount) {
		return "Paiement de " + amount + " EUR effectue avec Paypal.";
	}
}
