package com.questlog.controller;

import com.questlog.dto.RoutineRequest;
import com.questlog.dto.RoutineResponse;
import com.questlog.service.RoutineService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/routines")
@RequiredArgsConstructor
public class RoutineController {

    private final RoutineService routineService;

    @PostMapping
    public ResponseEntity<RoutineResponse> createRoutine(@RequestBody RoutineRequest request) {
        return ResponseEntity.ok(routineService.createRoutine(request));
    }

    @GetMapping
    public ResponseEntity<List<RoutineResponse>> getRoutines(
            @RequestParam Long userId,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        if (date == null) date = LocalDate.now();
        return ResponseEntity.ok(routineService.getRoutinesForUser(userId, date));
    }

    @PostMapping("/{id}/toggle")
    public ResponseEntity<RoutineResponse> toggleRoutine(
            @PathVariable Long id,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        if (date == null) date = LocalDate.now();
        return ResponseEntity.ok(routineService.toggleRoutine(id, date));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRoutine(@PathVariable Long id) {
        routineService.deleteRoutine(id);
        return ResponseEntity.noContent().build();
    }
}
