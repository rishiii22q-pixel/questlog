package com.questlog.controller;

import com.questlog.dto.CalendarDayDTO;
import com.questlog.entity.AdhocTask;
import com.questlog.entity.DailyCompletion;
import com.questlog.entity.MandatoryRoutine;
import com.questlog.repository.AdhocTaskRepository;
import com.questlog.repository.DailyCompletionRepository;
import com.questlog.repository.MandatoryRoutineRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/calendar")
@RequiredArgsConstructor
public class CalendarController {

    private final MandatoryRoutineRepository routineRepo;
    private final AdhocTaskRepository taskRepo;
    private final DailyCompletionRepository completionRepo;

    /**
     * Returns a day-by-day summary for an entire month.
     * Used by the frontend monthly calendar to color-code each day.
     */
    @GetMapping
    public ResponseEntity<List<CalendarDayDTO>> getMonthCalendar(
            @RequestParam Long userId,
            @RequestParam int year,
            @RequestParam int month) {

        YearMonth ym = YearMonth.of(year, month);
        LocalDate firstDay = ym.atDay(1);
        LocalDate lastDay = ym.atEndOfMonth();
        LocalDate today = LocalDate.now();

        // Pre-fetch completion records for the month
        Map<LocalDate, DailyCompletion> completionMap =
            completionRepo.findByUserIdAndCompletionDateBetween(userId, firstDay, lastDay)
                .stream().collect(Collectors.toMap(DailyCompletion::getCompletionDate, dc -> dc));

        // Pre-fetch all ad-hoc tasks for the month
        List<AdhocTask> monthTasks = taskRepo.findByUserIdAndTargetDateBetween(userId, firstDay, lastDay);
        Map<LocalDate, List<AdhocTask>> tasksByDate = monthTasks.stream()
                .collect(Collectors.groupingBy(AdhocTask::getTargetDate));

        // Pre-fetch all routines for this user
        List<MandatoryRoutine> allRoutines = routineRepo.findByUserId(userId);

        List<CalendarDayDTO> result = new ArrayList<>();
        LocalDate current = firstDay;

        while (!current.isAfter(lastDay)) {
            final LocalDate day = current;

            // Count routines active on this day
            List<MandatoryRoutine> dayRoutines = allRoutines.stream()
                    .filter(r -> r.isActiveOnDate(day))
                    .collect(Collectors.toList());
            int totalRoutines = dayRoutines.size();

            // Count completed routines: use DailyCompletion for past days, live data for today/future
            int completedRoutines = 0;
            boolean allDone = false;

            if (!day.isAfter(today)) {
                DailyCompletion dc = completionMap.get(day);
                if (dc != null) {
                    completedRoutines = dc.getCompletedRoutines();
                    allDone = dc.isAllCompleted();
                } else if (day.equals(today)) {
                    // Live calculation for today
                    completedRoutines = (int) dayRoutines.stream()
                            .filter(r -> day.equals(r.getLastCompletedDate()))
                            .count();
                    allDone = totalRoutines > 0 && completedRoutines == totalRoutines;
                }
            }

            // Count ad-hoc tasks
            List<AdhocTask> dayTasks = tasksByDate.getOrDefault(day, List.of());
            int totalTasks = dayTasks.size();
            int completedTasks = (int) dayTasks.stream().filter(AdhocTask::isCompleted).count();

            result.add(CalendarDayDTO.builder()
                    .date(day.toString())
                    .totalRoutines(totalRoutines)
                    .completedRoutines(completedRoutines)
                    .totalAdhocTasks(totalTasks)
                    .completedAdhocTasks(completedTasks)
                    .allRoutinesDone(allDone)
                    .isToday(day.equals(today))
                    .isFuture(day.isAfter(today))
                    .build());

            current = current.plusDays(1);
        }

        return ResponseEntity.ok(result);
    }
}
