package com.questlog.controller;

import com.questlog.dto.DashboardResponse;
import com.questlog.dto.RoutineResponse;
import com.questlog.dto.AdhocTaskResponse;
import com.questlog.dto.UserResponse;
import com.questlog.service.AdhocTaskService;
import com.questlog.service.RoutineService;
import com.questlog.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final UserService userService;
    private final RoutineService routineService;
    private final AdhocTaskService adhocTaskService;

    @GetMapping
    public ResponseEntity<DashboardResponse> getDashboard(
            @RequestParam Long userId,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        if (date == null) date = LocalDate.now();

        UserResponse user = userService.getUserById(userId);
        List<RoutineResponse> routines = routineService.getRoutinesForUser(userId, date);
        List<AdhocTaskResponse> tasks = adhocTaskService.getTasksForUserAndDate(userId, date);

        int completed = (int) routines.stream().filter(r -> "COMPLETED".equals(r.getStatus())).count();
        int total = routines.size();
        boolean allDone = total > 0 && completed == total;
        int masterStreak = routineService.calculateMasterStreak(userId);

        DashboardResponse response = DashboardResponse.builder()
                .user(user)
                .viewDate(date.toString())
                .mandatoryRoutines(routines)
                .adhocTasks(tasks)
                .completedRoutinesCount(completed)
                .totalRoutinesCount(total)
                .allRoutinesCompleted(allDone)
                .masterStreakDays(masterStreak)
                .build();

        return ResponseEntity.ok(response);
    }
}
