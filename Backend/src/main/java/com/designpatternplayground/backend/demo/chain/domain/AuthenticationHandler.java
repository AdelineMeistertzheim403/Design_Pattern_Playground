package com.designpatternplayground.backend.demo.chain.domain;

public class AuthenticationHandler extends RequestHandler {

	public AuthenticationHandler() {
		super("AUTH", "AuthenticationHandler");
	}

	@Override
	protected HandlerEvaluation evaluate(PipelineRequest request) {
		if (request.tokenState() == RequestTokenState.VALID) {
			return HandlerEvaluation.pass(
				"Token valide : " + request.requestName() + " peut passer au maillon suivant."
			);
		}

		return HandlerEvaluation.reject(
			request.tokenState() == RequestTokenState.EXPIRED
				? "Token expiré : la requête est arrêtee des le contrôle d authentification."
				: "Aucun token fourni : la requête est rejetee avant toute validation métier.",
			label(),
			code()
		);
	}
}
