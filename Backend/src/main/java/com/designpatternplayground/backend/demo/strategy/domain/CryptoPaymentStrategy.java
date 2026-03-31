package com.designpatternplayground.backend.demo.strategy.domain;

import java.math.BigDecimal;

public class CryptoPaymentStrategy implements PaymentStrategy {

	@Override
	public String code() {
		return "CRYPTO";
	}

	@Override
	public String label() {
		return "Crypto";
	}

	@Override
	public String pay(BigDecimal amount) {
		return "Paiement de " + amount + " EUR effectue en cryptomonnaie.";
	}
}
