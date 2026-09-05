package com.questlog.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdhocTaskRequest {
    private Long userId;
    private String title;
    private String targetDate;   // ISO date: YYYY-MM-DD
    private String targetTime;   // HH:mm (optional)
    private int xpReward;
}
