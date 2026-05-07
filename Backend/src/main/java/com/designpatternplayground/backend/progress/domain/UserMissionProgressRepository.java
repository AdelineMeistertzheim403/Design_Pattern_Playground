package com.designpatternplayground.backend.progress.domain;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface UserMissionProgressRepository extends JpaRepository<UserMissionProgress, Long> {

	Optional<UserMissionProgress> findByUser_IdAndMissionId(Long userId, String missionId);

	List<UserMissionProgress> findAllByUser_Id(Long userId);
}
