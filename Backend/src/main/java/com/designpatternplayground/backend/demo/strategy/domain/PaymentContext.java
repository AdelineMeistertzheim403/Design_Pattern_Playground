package com.designpatternplayground.backend.demo.strategy.domain;

import java.math.BigDecimal;

public class PaymentContext {

	private PaymentStrategy strategy;

	public PaymentContext(PaymentStrategy strategy) {
		this.strategy = strategy;
	}

	public String execute(BigDecimal amount) {
		return strategy.pay(amount);
	}

	public void setStrategy(PaymentStrategy strategy) {
		this.strategy = strategy;
	}
}
