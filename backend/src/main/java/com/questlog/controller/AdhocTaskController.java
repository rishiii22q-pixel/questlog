package com.questlog.controller;

import com.questlog.dto.AdhocTaskRequest;
import com.questlog.dto.AdhocTaskResponse;
import com.questlog.service.AdhocTaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/tasks/adhoc")
@RequiredArgsConstructor
public class AdhocTaskController {

    private final AdhocTaskService adhocTaskService;

    @PostMapping
    public ResponseEntity<AdhocTaskResponse> createTask(@RequestBody AdhocTaskRequest request) {
        return ResponseEntity.ok(adhocTaskService.createTask(request));
    }

    @GetMapping
    public ResponseEntity<List<AdhocTaskResponse>> getTasks(
            @RequestParam Long userId,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        if (date != null) {
            return ResponseEntity.ok(adhocTaskService.getTasksForUserAndDate(userId, date));
        }
        return ResponseEntity.ok(adhocTaskService.getUpcomingTasks(userId));
    }

    @GetMapping("/range")
    public ResponseEntity<List<AdhocTaskResponse>> getTasksInRange(
            @RequestParam Long userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(adhocTaskService.getTasksInRange(userId, from, to));
    }

    @PutMapping("/{id}/toggle")
    public ResponseEntity<AdhocTaskResponse> toggleTask(@PathVariable Long id) {
        return ResponseEntity.ok(adhocTaskService.toggleTask(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        adhocTaskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }
}
