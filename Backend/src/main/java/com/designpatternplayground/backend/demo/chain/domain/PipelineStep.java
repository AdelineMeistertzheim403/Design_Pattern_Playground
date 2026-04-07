package com.designpatternplayground.backend.demo.chain.domain;

public record PipelineStep(
	int index,
	String handlerCode,
	String handlerLabel,
	String status,
	boolean passed,
	String detail
) {
}
