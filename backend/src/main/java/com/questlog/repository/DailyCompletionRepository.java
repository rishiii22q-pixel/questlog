package com.questlog.repository;

import com.questlog.entity.DailyCompletion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface DailyCompletionRepository extends JpaRepository<DailyCompletion, Long> {
    Optional<DailyCompletion> findByUserIdAndCompletionDate(Long userId, LocalDate date);
    List<DailyCompletion> findByUserIdOrderByCompletionDateDesc(Long userId);
    List<DailyCompletion> findByUserIdAndCompletionDateBetween(Long userId, LocalDate from, LocalDate to);
}
