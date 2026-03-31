package com.designpatternplayground.backend.auth.domain;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface RefreshTokenSessionRepository extends JpaRepository<RefreshTokenSession, Long> {

	Optional<RefreshTokenSession> findByToken(String token);

	long deleteByToken(String token);

	long deleteByUser_Id(Long userId);

	long deleteByExpiresAtBefore(LocalDateTime threshold);
}
