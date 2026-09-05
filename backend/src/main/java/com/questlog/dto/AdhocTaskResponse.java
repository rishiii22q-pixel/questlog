package com.questlog.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdhocTaskResponse {
    private Long id;
    private String title;
    private String targetDate;
    private String targetTime;
    private boolean completed;
    private int xpReward;
    private String completedAt;
    private String dateLabel;     // "Today", "Tomorrow", "Monday", etc.
}
