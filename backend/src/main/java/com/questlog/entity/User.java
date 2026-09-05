package com.questlog.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String username;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(name = "dream_goal", length = 250)
    private String dreamGoal;

    @Column(name = "current_xp", nullable = false)
    private int currentXp = 0;

    @Column(name = "current_level", nullable = false)
    private int currentLevel = 1;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    // XP required to reach next level — formula: 100 * level^1.5
    public int getXpForNextLevel() {
        return (int) (100 * Math.pow(currentLevel, 1.5));
    }
}
