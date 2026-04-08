package com.designpatternplayground.backend.demo.proxy;

public record ProxyConfig(
	String mode,
	String requestLabel,
	String requesterRole,
	String resourceCode,
	String cacheState
) {
}
