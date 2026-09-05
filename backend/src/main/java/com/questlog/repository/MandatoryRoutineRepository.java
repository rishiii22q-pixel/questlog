package com.questlog.repository;

import com.questlog.entity.MandatoryRoutine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MandatoryRoutineRepository extends JpaRepository<MandatoryRoutine, Long> {
    List<MandatoryRoutine> findByUserId(Long userId);
    List<MandatoryRoutine> findByUserIdAndFrequency(Long userId, String frequency);
}
