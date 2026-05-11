package com.designpatternplayground.backend.uml.domain;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface UserUmlDiagramRepository extends JpaRepository<UserUmlDiagramDocument, Long> {

	List<UserUmlDiagramDocument> findAllByOwnerIdOrderByUpdatedAtDesc(Long ownerId);

	Optional<UserUmlDiagramDocument> findByOwnerIdAndCodeIgnoreCase(Long ownerId, String code);
}
