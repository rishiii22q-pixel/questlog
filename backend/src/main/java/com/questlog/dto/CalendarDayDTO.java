package com.questlog.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CalendarDayDTO {
    private String date;
    private int totalRoutines;
    private int completedRoutines;
    private int totalAdhocTasks;
    private int completedAdhocTasks;
    private boolean allRoutinesDone;
    private boolean isToday;
    private boolean isFuture;
}
