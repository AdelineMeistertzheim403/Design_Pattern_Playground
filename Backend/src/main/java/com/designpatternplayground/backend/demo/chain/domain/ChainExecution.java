package com.designpatternplayground.backend.demo.chain.domain;

import java.util.List;

public record ChainExecution(
	String finalDecision,
	String handledBy,
	String stoppedAt,
	List<PipelineStep> steps
) {
}
