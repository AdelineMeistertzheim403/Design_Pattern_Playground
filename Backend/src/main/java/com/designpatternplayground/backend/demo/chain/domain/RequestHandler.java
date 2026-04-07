package com.designpatternplayground.backend.demo.chain.domain;

import java.util.ArrayList;
import java.util.List;

public abstract class RequestHandler {

	private final String code;
	private final String label;
	private RequestHandler next;

	protected RequestHandler(String code, String label) {
		this.code = code;
		this.label = label;
	}

	public String code() {
		return code;
	}

	public String label() {
		return label;
	}

	public RequestHandler linkWith(RequestHandler nextHandler) {
		this.next = nextHandler;
		return nextHandler;
	}

	public ChainExecution handle(PipelineRequest request) {
		return handle(request, new ArrayList<>());
	}

	private ChainExecution handle(PipelineRequest request, List<PipelineStep> steps) {
		HandlerEvaluation evaluation = evaluate(request);
		steps.add(new PipelineStep(
			steps.size() + 1,
			code,
			label,
			evaluation.status(),
			evaluation.passed(),
			evaluation.detail()
		));

		if (!evaluation.continueChain() || next == null) {
			return new ChainExecution(
				evaluation.finalDecision(),
				evaluation.handledBy(),
				evaluation.stoppedAt(),
				List.copyOf(steps)
			);
		}

		return next.handle(request, steps);
	}

	protected abstract HandlerEvaluation evaluate(PipelineRequest request);
}

record HandlerEvaluation(
	String status,
	boolean passed,
	boolean continueChain,
	String detail,
	String finalDecision,
	String handledBy,
	String stoppedAt
) {
	static HandlerEvaluation pass(String detail) {
		return new HandlerEvaluation("PASSED", true, true, detail, "IN_PROGRESS", "", "");
	}

	static HandlerEvaluation reject(String detail, String handledBy, String stoppedAt) {
		return new HandlerEvaluation("REJECTED", false, false, detail, "REJECTED", handledBy, stoppedAt);
	}

	static HandlerEvaluation handled(String detail, String handledBy, String stoppedAt) {
		return new HandlerEvaluation("HANDLED", true, false, detail, "ACCEPTED", handledBy, stoppedAt);
	}
}
