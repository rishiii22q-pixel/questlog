package com.questlog.service;

import com.questlog.dto.RoutineRequest;
import com.questlog.dto.RoutineResponse;
import com.questlog.entity.DailyCompletion;
import com.questlog.entity.MandatoryRoutine;
import com.questlog.entity.User;
import com.questlog.repository.DailyCompletionRepository;
import com.questlog.repository.MandatoryRoutineRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class RoutineService {

    private final MandatoryRoutineRepository routineRepository;
    private final DailyCompletionRepository completionRepository;
    private final UserService userService;

    public RoutineResponse createRoutine(RoutineRequest request) {
        User user = userService.getUserEntity(request.getUserId());

        MandatoryRoutine routine = new MandatoryRoutine();
        routine.setUser(user);
        routine.setTitle(request.getTitle());
        routine.setFrequency(request.getFrequency() != null ? request.getFrequency() : "DAILY");
        routine.setDaysOfWeek(request.getDaysOfWeek() != null ? request.getDaysOfWeek() : "MON,TUE,WED,THU,FRI,SAT,SUN");
        routine.setReminderEnabled(request.isReminderEnabled());
        routine.setReminderMinutesBefore(request.getReminderMinutesBefore() > 0 ? request.getReminderMinutesBefore() : 10);

        if (request.getStartTime() != null && !request.getStartTime().isEmpty()) {
            routine.setStartTime(LocalTime.parse(request.getStartTime()));
        }
        if (request.getEndTime() != null && !request.getEndTime().isEmpty()) {
            routine.setEndTime(LocalTime.parse(request.getEndTime()));
        }

        MandatoryRoutine saved = routineRepository.save(routine);
        return toResponse(saved, LocalDate.now(), 0);
    }

    @Transactional(readOnly = true)
    public List<RoutineResponse> getRoutinesForUser(Long userId, LocalDate date) {
        return routineRepository.findByUserId(userId).stream()
                .filter(r -> r.isActiveOnDate(date))
                .map(r -> toResponse(r, date, 0))
                .collect(Collectors.toList());
    }

    /**
     * Core streak toggle logic:
     * - If already completed today → uncheck
     * - If last completed yesterday → streak continues (+1)
     * - If missed → streak resets to 1
     * - After any toggle, update DailyCompletion record for master streak
     */
    public RoutineResponse toggleRoutine(Long routineId, LocalDate date) {
        MandatoryRoutine routine = routineRepository.findById(routineId)
                .orElseThrow(() -> new RuntimeException("Routine not found: " + routineId));

        LocalDate lastDate = routine.getLastCompletedDate();
        int xpEarned = 0;

        if (date.equals(lastDate)) {
            // Uncheck: reverse the completion
            routine.setLastCompletedDate(null);
            routine.setStreakCount(Math.max(0, routine.getStreakCount() - 1));
        } else {
            // Check: apply streak state machine
            if (lastDate != null && lastDate.equals(date.minusDays(1))) {
                routine.setStreakCount(routine.getStreakCount() + 1);
            } else {
                routine.setStreakCount(1);
            }
            routine.setLastCompletedDate(date);
            xpEarned = 50 + (routine.getStreakCount() * 5);
            userService.addXp(routine.getUser(), xpEarned);
        }

        MandatoryRoutine saved = routineRepository.save(routine);

        // === Update DailyCompletion for master streak ===
        updateDailyCompletion(routine.getUser().getId(), date);

        return toResponse(saved, date, xpEarned);
    }

    /**
     * Recalculates and saves the DailyCompletion record for a given user and date.
     * Called after every toggle so master streak is always up-to-date.
     */
    private void updateDailyCompletion(Long userId, LocalDate date) {
        List<MandatoryRoutine> allRoutines = routineRepository.findByUserId(userId).stream()
                .filter(r -> r.isActiveOnDate(date))
                .collect(Collectors.toList());

        int total = allRoutines.size();
        int completed = (int) allRoutines.stream()
                .filter(r -> date.equals(r.getLastCompletedDate()))
                .count();
        boolean allDone = total > 0 && completed == total;

        Optional<DailyCompletion> existing = completionRepository.findByUserIdAndCompletionDate(userId, date);
        DailyCompletion dc = existing.orElseGet(() -> {
            DailyCompletion newDc = new DailyCompletion();
            newDc.setUser(userService.getUserEntity(userId));
            newDc.setCompletionDate(date);
            return newDc;
        });

        dc.setTotalRoutines(total);
        dc.setCompletedRoutines(completed);
        dc.setAllCompleted(allDone);
        completionRepository.save(dc);
    }

    /**
     * Master streak = consecutive days (working backwards from today) where
     * ALL mandatory routines were completed. Day resets if ANY routine is missed.
     */
    public int calculateMasterStreak(Long userId) {
        LocalDate today = LocalDate.now();
        int streak = 0;

        // Check today first (might already be complete)
        Optional<DailyCompletion> todayRecord = completionRepository.findByUserIdAndCompletionDate(userId, today);
        if (todayRecord.isPresent() && todayRecord.get().isAllCompleted()) {
            streak++;
        }

        // Walk back from yesterday
        LocalDate checkDate = today.minusDays(1);
        for (int i = 0; i < 365; i++) {  // max 1 year lookback
            Optional<DailyCompletion> record = completionRepository.findByUserIdAndCompletionDate(userId, checkDate);
            if (record.isEmpty() || !record.get().isAllCompleted()) break;
            streak++;
            checkDate = checkDate.minusDays(1);
        }

        return streak;
    }

    public void deleteRoutine(Long routineId) {
        routineRepository.deleteById(routineId);
    }

    public RoutineResponse toResponse(MandatoryRoutine routine, LocalDate forDate, int xpEarned) {
        DateTimeFormatter timeFmt = DateTimeFormatter.ofPattern("HH:mm");
        return RoutineResponse.builder()
                .id(routine.getId())
                .title(routine.getTitle())
                .startTime(routine.getStartTime() != null ? routine.getStartTime().format(timeFmt) : null)
                .endTime(routine.getEndTime() != null ? routine.getEndTime().format(timeFmt) : null)
                .frequency(routine.getFrequency())
                .daysOfWeek(routine.getDaysOfWeek())
                .reminderEnabled(routine.isReminderEnabled())
                .reminderMinutesBefore(routine.getReminderMinutesBefore())
                .streakCount(routine.getStreakCount())
                .lastCompletedDate(routine.getLastCompletedDate() != null ? routine.getLastCompletedDate().toString() : null)
                .status(routine.getStatusForDate(forDate))
                .xpEarned(xpEarned)
                .build();
    }
}
