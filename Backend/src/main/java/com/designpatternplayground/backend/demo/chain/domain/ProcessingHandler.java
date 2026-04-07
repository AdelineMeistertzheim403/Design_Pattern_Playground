package com.designpatternplayground.backend.demo.chain.domain;

public class ProcessingHandler extends RequestHandler {

	public ProcessingHandler() {
		super("PROCESSING", "ProcessingHandler");
	}

	@Override
	protected HandlerEvaluation evaluate(PipelineRequest request) {
		return HandlerEvaluation.handled(
			request.processingTarget().handledMessage(),
			label(),
			code()
		);
	}
}
