package com.designpatternplayground.backend.progress.domain;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface UserBadgeUnlockRepository extends JpaRepository<UserBadgeUnlock, Long> {

	Optional<UserBadgeUnlock> findByUser_IdAndBadgeCode(Long userId, String badgeCode);

	List<UserBadgeUnlock> findAllByUser_IdOrderByUnlockedAtDesc(Long userId);

	long countByUser_Id(Long userId);
}
