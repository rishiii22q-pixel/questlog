package com.questlog.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;

/**
 * Tracks whether ALL mandatory routines were completed on a specific date for a user.
 * This is the source of truth for the master streak counter.
 * Ad-hoc tasks do NOT affect this record.
 */
@Entity
@Table(name = "daily_completion",
    uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "completion_date"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DailyCompletion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "completion_date", nullable = false)
    private LocalDate completionDate;

    @Column(name = "all_completed", nullable = false)
    private boolean allCompleted = false;

    @Column(name = "total_routines")
    private int totalRoutines = 0;

    @Column(name = "completed_routines")
    private int completedRoutines = 0;
}
