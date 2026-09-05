package com.questlog.service;

import com.questlog.dto.AdhocTaskRequest;
import com.questlog.dto.AdhocTaskResponse;
import com.questlog.entity.AdhocTask;
import com.questlog.entity.User;
import com.questlog.repository.AdhocTaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class AdhocTaskService {

    private final AdhocTaskRepository taskRepository;
    private final UserService userService;

    public AdhocTaskResponse createTask(AdhocTaskRequest request) {
        User user = userService.getUserEntity(request.getUserId());

        AdhocTask task = new AdhocTask();
        task.setUser(user);
        task.setTitle(request.getTitle());
        task.setTargetDate(LocalDate.parse(request.getTargetDate()));
        task.setXpReward(request.getXpReward() > 0 ? request.getXpReward() : 25);
        task.setCompleted(false);

        if (request.getTargetTime() != null && !request.getTargetTime().isEmpty()) {
            task.setTargetTime(LocalTime.parse(request.getTargetTime()));
        }

        AdhocTask saved = taskRepository.save(task);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<AdhocTaskResponse> getTasksForUserAndDate(Long userId, LocalDate date) {
        return taskRepository.findByUserIdAndTargetDate(userId, date).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AdhocTaskResponse> getUpcomingTasks(Long userId) {
        return taskRepository.findByUserIdAndTargetDateGreaterThanEqual(userId, LocalDate.now()).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AdhocTaskResponse> getTasksInRange(Long userId, LocalDate from, LocalDate to) {
        return taskRepository.findByUserIdAndTargetDateBetween(userId, from, to).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Toggle completion of an ad-hoc task.
     * Completing grants bonus XP. Missing it NEVER breaks the mandatory routine streak.
     */
    public AdhocTaskResponse toggleTask(Long taskId) {
        AdhocTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found: " + taskId));

        if (!task.isCompleted()) {
            task.setCompleted(true);
            task.setCompletedAt(LocalDateTime.now());
            // Award bonus XP to user (does NOT affect habit streaks)
            userService.addXp(task.getUser(), task.getXpReward());
        } else {
            task.setCompleted(false);
            task.setCompletedAt(null);
            // Optionally: deduct XP on uncheck
            // userService.addXp(task.getUser(), -task.getXpReward());
        }

        return toResponse(taskRepository.save(task));
    }

    public void deleteTask(Long taskId) {
        taskRepository.deleteById(taskId);
    }

    public AdhocTaskResponse toResponse(AdhocTask task) {
        LocalDate today = LocalDate.now();
        LocalDate target = task.getTargetDate();
        DateTimeFormatter timeFmt = DateTimeFormatter.ofPattern("HH:mm");

        String dateLabel;
        if (target.equals(today)) dateLabel = "Today";
        else if (target.equals(today.plusDays(1))) dateLabel = "Tomorrow";
        else if (target.isBefore(today)) dateLabel = "Overdue";
        else {
            long daysAway = java.time.temporal.ChronoUnit.DAYS.between(today, target);
            dateLabel = "In " + daysAway + " days";
        }

        return AdhocTaskResponse.builder()
                .id(task.getId())
                .title(task.getTitle())
                .targetDate(task.getTargetDate().toString())
                .targetTime(task.getTargetTime() != null ? task.getTargetTime().format(timeFmt) : null)
                .completed(task.isCompleted())
                .xpReward(task.getXpReward())
                .completedAt(task.getCompletedAt() != null ? task.getCompletedAt().toString() : null)
                .dateLabel(dateLabel)
                .build();
    }
}
