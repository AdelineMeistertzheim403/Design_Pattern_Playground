package com.designpatternplayground.backend.uml.domain;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface UmlDiagramRepository extends JpaRepository<UmlDiagramDocument, Long> {

	Optional<UmlDiagramDocument> findByCodeIgnoreCase(String code);

	List<UmlDiagramDocument> findAllByOrderByUpdatedAtDesc();
}
