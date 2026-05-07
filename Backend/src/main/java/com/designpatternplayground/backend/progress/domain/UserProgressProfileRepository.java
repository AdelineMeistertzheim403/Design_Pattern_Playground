package com.designpatternplayground.backend.progress.domain;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface UserProgressProfileRepository extends JpaRepository<UserProgressProfile, Long> {

	Optional<UserProgressProfile> findByUser_Id(Long userId);
}
