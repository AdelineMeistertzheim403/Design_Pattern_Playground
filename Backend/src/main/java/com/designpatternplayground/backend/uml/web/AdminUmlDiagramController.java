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

import com.designpatternplayground.backend.auth.security.AdminAccessGuard;
import com.designpatternplayground.backend.auth.security.AuthenticatedUser;
import com.designpatternplayground.backend.uml.application.UmlDiagramService;

@RestController
@RequestMapping("/api/admin/uml-diagrams")
public class AdminUmlDiagramController {

	private final UmlDiagramService umlDiagramService;
	private final AdminAccessGuard adminAccessGuard;

	public AdminUmlDiagramController(UmlDiagramService umlDiagramService, AdminAccessGuard adminAccessGuard) {
		this.umlDiagramService = umlDiagramService;
		this.adminAccessGuard = adminAccessGuard;
	}

	@GetMapping
	public List<UmlDiagramResponse> listDiagrams(Authentication authentication) {
		adminAccessGuard.ensureAdminAccessAllowed((AuthenticatedUser) authentication.getPrincipal());
		return umlDiagramService.listAll();
	}

	@GetMapping("/{code}")
	public UmlDiagramResponse getDiagram(@PathVariable String code, Authentication authentication) {
		adminAccessGuard.ensureAdminAccessAllowed((AuthenticatedUser) authentication.getPrincipal());
		return umlDiagramService.getByCode(code);
	}

	@PutMapping("/{code}")
	public UmlDiagramResponse saveDiagram(
		@PathVariable String code,
		@Valid @RequestBody UmlDiagramSaveRequest request,
		Authentication authentication
	) {
		AuthenticatedUser user = (AuthenticatedUser) authentication.getPrincipal();
		adminAccessGuard.ensureAdminAccessAllowed(user);
		return umlDiagramService.save(code, request, user);
	}
}
