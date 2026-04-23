package com.designpatternplayground.backend.uml.application;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.designpatternplayground.backend.auth.security.AuthenticatedUser;
import com.designpatternplayground.backend.uml.domain.UmlDiagramDocument;
import com.designpatternplayground.backend.uml.domain.UmlDiagramRepository;
import com.designpatternplayground.backend.uml.web.UmlDiagramResponse;
import com.designpatternplayground.backend.uml.web.UmlDiagramSaveRequest;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

@Service
public class UmlDiagramService {

	private final UmlDiagramRepository umlDiagramRepository;
	private final ObjectMapper objectMapper;

	public UmlDiagramService(UmlDiagramRepository umlDiagramRepository, ObjectMapper objectMapper) {
		this.umlDiagramRepository = umlDiagramRepository;
		this.objectMapper = objectMapper;
	}

	@Transactional(readOnly = true)
	public UmlDiagramResponse getByCode(String code) {
		return umlDiagramRepository.findByCodeIgnoreCase(normalizeCode(code))
			.map(this::toResponse)
			.orElse(null);
	}

	@Transactional(readOnly = true)
	public List<UmlDiagramResponse> listAll() {
		return umlDiagramRepository.findAllByOrderByUpdatedAtDesc().stream()
			.map(this::toResponse)
			.toList();
	}

	@Transactional
	public UmlDiagramResponse save(String code, UmlDiagramSaveRequest request, AuthenticatedUser actor) {
		String normalizedCode = normalizeCode(code);
		String requestCode = normalizeCode(request.code());
		if (!normalizedCode.equals(requestCode)) {
			throw new IllegalArgumentException("Le code du chemin et le code du payload doivent correspondre.");
		}

		validateDiagram(request.diagram());

		LocalDateTime now = LocalDateTime.now();
		UmlDiagramDocument document = umlDiagramRepository.findByCodeIgnoreCase(normalizedCode)
			.orElseGet(() -> new UmlDiagramDocument(
				normalizedCode,
				request.name().trim(),
				"{}",
				now,
				now,
				actor.username()
			));

		document.setCode(normalizedCode);
		document.setName(request.name().trim());
		document.setDiagramJson(serializeDiagram(request.diagram()));
		document.setUpdatedAt(now);
		document.setUpdatedBy(actor.username());

		if (document.getCreatedAt() == null) {
			document.setCreatedAt(now);
		}

		return toResponse(umlDiagramRepository.save(document));
	}

	private UmlDiagramResponse toResponse(UmlDiagramDocument document) {
		return new UmlDiagramResponse(
			document.getCode(),
			document.getName(),
			deserializeDiagram(document.getDiagramJson()),
			document.getCreatedAt(),
			document.getUpdatedAt(),
			document.getUpdatedBy()
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

	private String serializeDiagram(JsonNode diagram) {
		return objectMapper.writeValueAsString(diagram);
	}

	private JsonNode deserializeDiagram(String diagramJson) {
		return objectMapper.readTree(diagramJson);
	}
}
