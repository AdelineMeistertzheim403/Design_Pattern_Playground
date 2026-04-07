package com.designpatternplayground.backend.demo.chain;

public record ChainConfig(
	String mode,
	String requestName,
	String tokenState,
	String payloadState,
	String processingTarget
) {
}
