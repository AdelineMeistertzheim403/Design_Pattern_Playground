package com.designpatternplayground.backend.demo.strategy;

import java.math.BigDecimal;

public record StrategyConfig(
	String mode,
	BigDecimal amount,
	String strategy
) {
}
