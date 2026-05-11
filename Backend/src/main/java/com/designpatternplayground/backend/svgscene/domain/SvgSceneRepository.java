package com.designpatternplayground.backend.svgscene.domain;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface SvgSceneRepository extends JpaRepository<SvgSceneDocument, Long> {

	Optional<SvgSceneDocument> findByCodeIgnoreCase(String code);

	List<SvgSceneDocument> findAllByOrderByUpdatedAtDesc();
}
