package com.questlog.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;

@Entity
@Table(name = "mandatory_routines")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MandatoryRoutine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(name = "start_time")
    private LocalTime startTime;   // e.g. 18:00 (6:00 PM)

    @Column(name = "end_time")
    private LocalTime endTime;     // e.g. 20:00 (8:00 PM)

    // DAILY, WEEKLY, MONTHLY
    @Column(nullable = false, length = 20)
    private String frequency = "DAILY";

    // Comma-separated: MON,TUE,WED,THU,FRI,SAT,SUN
    @Column(name = "days_of_week", length = 50)
    private String daysOfWeek = "MON,TUE,WED,THU,FRI,SAT,SUN";

    @Column(name = "reminder_enabled")
    private boolean reminderEnabled = true;

    @Column(name = "reminder_minutes_before")
    private int reminderMinutesBefore = 10;

    @Column(name = "streak_count")
    private int streakCount = 0;

    @Column(name = "last_completed_date")
    private LocalDate lastCompletedDate;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    // Determine if this routine is active on a given date
    public boolean isActiveOnDate(LocalDate date) {
        if ("DAILY".equals(frequency)) {
            // Check if the day of week matches
            String dayAbbr = date.getDayOfWeek().name().substring(0, 3);
            return daysOfWeek == null || daysOfWeek.contains(dayAbbr);
        }
        return true;
    }

    // Determine completion status for a given date
    public String getStatusForDate(LocalDate date) {
        if (lastCompletedDate == null) return "PENDING";
        if (lastCompletedDate.equals(date)) return "COMPLETED";
        if (lastCompletedDate.equals(date.minusDays(1))) return "PENDING";
        if (lastCompletedDate.isBefore(date.minusDays(1))) return "MISSED";
        return "PENDING";
    }
}
