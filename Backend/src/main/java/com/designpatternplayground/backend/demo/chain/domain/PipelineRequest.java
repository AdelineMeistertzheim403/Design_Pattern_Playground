package com.designpatternplayground.backend.demo.chain.domain;

public record PipelineRequest(
	String requestName,
	RequestTokenState tokenState,
	RequestPayloadState payloadState,
	ProcessingTarget processingTarget
) {
}
