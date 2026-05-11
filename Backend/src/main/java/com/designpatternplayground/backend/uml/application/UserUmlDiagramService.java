package com.designpatternplayground.backend.uml.application;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.designpatternplayground.backend.auth.domain.UserAccount;
import com.designpatternplayground.backend.auth.domain.UserAccountRepository;
import com.designpatternplayground.backend.auth.security.AuthenticatedUser;
import com.designpatternplayground.backend.uml.domain.UserUmlDiagramDocument;
import com.designpatternplayground.backend.uml.domain.UserUmlDiagramRepository;
import com.designpatternplayground.backend.uml.web.UmlDiagramResponse;
import com.designpatternplayground.backend.uml.web.UmlDiagramSaveRequest;
import com.designpatternplayground.backend.uml.web.UserUmlDiagramSummaryResponse;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

@Service
public class UserUmlDiagramService {

	private final UserUmlDiagramRepository userUmlDiagramRepository;
	private final UserAccountRepository userAccountRepository;
	private final ObjectMapper objectMapper;

	public UserUmlDiagramService(
		UserUmlDiagramRepository userUmlDiagramRepository,
		UserAccountRepository userAccountRepository,
		ObjectMapper objectMapper
	) {
		this.userUmlDiagramRepository = userUmlDiagramRepository;
		this.userAccountRepository = userAccountRepository;
		this.objectMapper = objectMapper;
	}

	@Transactional(readOnly = true)
	public List<UserUmlDiagramSummaryResponse> listForUser(AuthenticatedUser actor) {
		// User diagrams are intentionally isolated per account. The public studio never
		// exposes another user's drafts or saved work through shared codes.
		return userUmlDiagramRepository.findAllByOwnerIdOrderByUpdatedAtDesc(actor.id()).stream()
			.map(document -> new UserUmlDiagramSummaryResponse(
				document.getCode(),
				document.getName(),
				document.getCreatedAt(),
				document.getUpdatedAt()
			))
			.toList();
	}

	@Transactional(readOnly = true)
	public UmlDiagramResponse getForUser(String code, AuthenticatedUser actor) {
		return userUmlDiagramRepository.findByOwnerIdAndCodeIgnoreCase(actor.id(), normalizeCode(code))
			.map(this::toResponse)
			.orElse(null);
	}

	@Transactional
	public UmlDiagramResponse saveForUser(String code, UmlDiagramSaveRequest request, AuthenticatedUser actor) {
		String normalizedCode = normalizeCode(code);
		String requestCode = normalizeCode(request.code());
		if (!normalizedCode.equals(requestCode)) {
			throw new IllegalArgumentException("Le code du chemin et le code du payload doivent correspondre.");
		}

		validateDiagram(request.diagram());

		// We reload the persistent owner entity to keep the JPA association explicit and
		// avoid creating detached references from the security principal alone.
		UserAccount owner = userAccountRepository.findById(actor.id())
			.orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable."));
		LocalDateTime now = LocalDateTime.now();

		UserUmlDiagramDocument document = userUmlDiagramRepository
			.findByOwnerIdAndCodeIgnoreCase(actor.id(), normalizedCode)
			.orElseGet(() -> new UserUmlDiagramDocument(
				owner,
				normalizedCode,
				request.name().trim(),
				"{}",
				now,
				now
			));

		document.setOwner(owner);
		document.setCode(normalizedCode);
		document.setName(request.name().trim());
		document.setDiagramJson(objectMapper.writeValueAsString(request.diagram()));
		document.setUpdatedAt(now);

		if (document.getCreatedAt() == null) {
			document.setCreatedAt(now);
		}

		return toResponse(userUmlDiagramRepository.save(document));
	}

	private UmlDiagramResponse toResponse(UserUmlDiagramDocument document) {
		return new UmlDiagramResponse(
			document.getCode(),
			document.getName(),
			objectMapper.readTree(document.getDiagramJson()),
			document.getCreatedAt(),
			document.getUpdatedAt(),
			document.getOwner().getUsername()
		);
	}

	private String normalizeCode(String code) {
		if (code == null) {
			throw new IllegalArgumentException("Le code est obligatoire.");
		}

		String normalized = code.trim().toLowerCase(Locale.ROOT);
		if (normalized.isBlank()) {
			throw new IllegalArgumentException("Le code est obligatoire.");
		}

		if (!normalized.matches("[a-z0-9-]+")) {
			throw new IllegalArgumentException("Le code doit contenir uniquement des lettres minuscules, chiffres et tirets.");
		}

		return normalized;
	}

	private void validateDiagram(JsonNode diagram) {
		// The frontend editor stores more fields than the backend knows about, but the
		// structural contract stays minimal: a diagram object with class and relation arrays.
		if (!diagram.isObject()) {
			throw new IllegalArgumentException("Le diagramme doit etre un objet JSON.");
		}

		if (!diagram.has("classes") || !diagram.get("classes").isArray()) {
			throw new IllegalArgumentException("Le diagramme doit contenir un tableau classes.");
		}

		if (!diagram.has("relations") || !diagram.get("relations").isArray()) {
			throw new IllegalArgumentException("Le diagramme doit contenir un tableau relations.");
		}
	}
}
