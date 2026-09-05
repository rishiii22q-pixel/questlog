package com.questlog.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponse {
    private UserResponse user;
    private String viewDate;
    private List<RoutineResponse> mandatoryRoutines;
    private List<AdhocTaskResponse> adhocTasks;
    private int completedRoutinesCount;
    private int totalRoutinesCount;
    private boolean allRoutinesCompleted;
    private int masterStreakDays;
}
