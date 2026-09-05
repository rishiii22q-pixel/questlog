package com.questlog.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;

@Entity
@Table(name = "tasks_adhoc", indexes = {
    @Index(name = "idx_adhoc_user_date", columnList = "user_id, target_date")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdhocTask {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(name = "target_date", nullable = false)
    private LocalDate targetDate;

    @Column(name = "target_time")
    private LocalTime targetTime;

    @Column(name = "is_completed", nullable = false)
    private boolean completed = false;

    @Column(name = "xp_reward", nullable = false)
    private int xpReward = 25;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
