package com.designpatternplayground.backend.svgscene.domain;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface UserSvgSceneRepository extends JpaRepository<UserSvgSceneDocument, Long> {

	List<UserSvgSceneDocument> findAllByOwnerIdOrderByUpdatedAtDesc(Long ownerId);

	Optional<UserSvgSceneDocument> findByOwnerIdAndCodeIgnoreCase(Long ownerId, String code);
}
