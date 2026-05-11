package com.designpatternplayground.backend.uml.web;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.designpatternplayground.backend.auth.security.AuthenticatedUser;
import com.designpatternplayground.backend.uml.application.UserUmlDiagramService;

@RestController
@RequestMapping("/api/uml-studio/diagrams")
public class UserUmlDiagramController {

	private final UserUmlDiagramService userUmlDiagramService;

	public UserUmlDiagramController(UserUmlDiagramService userUmlDiagramService) {
		this.userUmlDiagramService = userUmlDiagramService;
	}

	@GetMapping
	public List<UserUmlDiagramSummaryResponse> listDiagrams(Authentication authentication) {
		return userUmlDiagramService.listForUser((AuthenticatedUser) authentication.getPrincipal());
	}

	@GetMapping("/{code}")
	public UmlDiagramResponse getDiagram(@PathVariable String code, Authentication authentication) {
		return userUmlDiagramService.getForUser(code, (AuthenticatedUser) authentication.getPrincipal());
	}

	@PutMapping("/{code}")
	public UmlDiagramResponse saveDiagram(
		@PathVariable String code,
		@Valid @RequestBody UmlDiagramSaveRequest request,
		Authentication authentication
	) {
		return userUmlDiagramService.saveForUser(code, request, (AuthenticatedUser) authentication.getPrincipal());
	}
}
