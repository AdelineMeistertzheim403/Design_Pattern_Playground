package com.designpatternplayground.backend.demo.chain.domain;

public class ValidationHandler extends RequestHandler {

	public ValidationHandler() {
		super("VALIDATION", "ValidationHandler");
	}

	@Override
	protected HandlerEvaluation evaluate(PipelineRequest request) {
		if (request.payloadState() == RequestPayloadState.VALID) {
			return HandlerEvaluation.pass(
				"Payload valide : " + request.requestName() + " peut continuer jusqu au traitement."
			);
		}

		return HandlerEvaluation.reject(
			"Payload invalide : la chaine stoppe avant le service metier.",
			label(),
			code()
		);
	}
}
