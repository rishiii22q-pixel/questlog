package com.questlog.repository;

import com.questlog.entity.AdhocTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AdhocTaskRepository extends JpaRepository<AdhocTask, Long> {
    List<AdhocTask> findByUserIdAndTargetDate(Long userId, LocalDate targetDate);
    List<AdhocTask> findByUserId(Long userId);
    List<AdhocTask> findByUserIdAndTargetDateGreaterThanEqual(Long userId, LocalDate fromDate);
    List<AdhocTask> findByUserIdAndTargetDateBetween(Long userId, LocalDate from, LocalDate to);
}
