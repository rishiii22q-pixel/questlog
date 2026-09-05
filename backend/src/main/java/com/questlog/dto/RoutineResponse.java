package com.questlog.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoutineResponse {
    private Long id;
    private String title;
    private String startTime;
    private String endTime;
    private String frequency;
    private String daysOfWeek;
    private boolean reminderEnabled;
    private int reminderMinutesBefore;
    private int streakCount;
    private String lastCompletedDate;
    private String status;         // COMPLETED, PENDING, MISSED
    private int xpEarned;          // XP earned from last toggle
}
