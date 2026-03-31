package com.designpatternplayground.backend.demo.strategy;

import java.math.BigDecimal;

public record StrategyConfig(
	BigDecimal amount,
	String strategy
) {
}
