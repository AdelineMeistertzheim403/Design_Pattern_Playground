package com.designpatternplayground.backend.progress.domain;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface UserPatternProgressRepository extends JpaRepository<UserPatternProgress, Long> {

	Optional<UserPatternProgress> findByUser_IdAndPatternCodeIgnoreCase(Long userId, String patternCode);

	List<UserPatternProgress> findAllByUser_Id(Long userId);
}
