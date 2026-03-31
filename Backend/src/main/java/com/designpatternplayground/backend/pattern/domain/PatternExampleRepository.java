package com.designpatternplayground.backend.pattern.domain;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface PatternExampleRepository extends JpaRepository<PatternExample, Long> {

	List<PatternExample> findAllByOrderByCategoryAscNameAsc();

	Optional<PatternExample> findBySlug(String slug);
}
