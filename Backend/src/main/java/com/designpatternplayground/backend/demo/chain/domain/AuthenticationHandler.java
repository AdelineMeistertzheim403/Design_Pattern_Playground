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
				? "Token expire : la requete est arretee des le controle d authentification."
				: "Aucun token fourni : la requete est rejetee avant toute validation metier.",
			label(),
			code()
		);
	}
}
