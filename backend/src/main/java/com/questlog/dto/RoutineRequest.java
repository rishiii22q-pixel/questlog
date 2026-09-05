package com.questlog.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoutineRequest {
    private Long userId;
    private String title;
    private String startTime;    // e.g. "18:00"
    private String endTime;      // e.g. "20:00"
    private String frequency;    // DAILY, WEEKLY, MONTHLY
    private String daysOfWeek;   // MON,TUE,WED,THU,FRI
    private boolean reminderEnabled;
    private int reminderMinutesBefore;
}
