package com.questlog.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String username;
    private String email;
    private String dreamGoal;
    private int currentXp;
    private int currentLevel;
    private int xpForNextLevel;
    private int xpProgressPercent;
}
