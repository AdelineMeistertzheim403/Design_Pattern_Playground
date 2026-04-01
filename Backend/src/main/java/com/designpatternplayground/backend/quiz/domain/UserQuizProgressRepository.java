package com.designpatternplayground.backend.quiz.domain;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface UserQuizProgressRepository extends JpaRepository<UserQuizProgress, Long> {

	Optional<UserQuizProgress> findByUser_IdAndPatternCodeIgnoreCase(Long userId, String patternCode);

	List<UserQuizProgress> findAllByUser_Id(Long userId);
}
