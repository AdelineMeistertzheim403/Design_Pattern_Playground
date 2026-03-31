package com.designpatternplayground.backend.demo.strategy.domain;

import java.math.BigDecimal;

public interface PaymentStrategy {

	String code();

	String label();

	String pay(BigDecimal amount);
}
