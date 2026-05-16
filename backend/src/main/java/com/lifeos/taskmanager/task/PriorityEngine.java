package com.lifeos.taskmanager.task;

import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Component
public class PriorityEngine {
    public int score(Task task) {
        if (task.isCompleted()) {
            return 0;
        }
        long daysLeft = ChronoUnit.DAYS.between(LocalDate.now(), task.getDeadline());
        int urgency = daysLeft < 0 ? 70
                : daysLeft == 0 ? 55
                : daysLeft == 1 ? 42
                : daysLeft <= 3 ? 28
                : 12;
        int importance = task.getImportance() * 12;
        int reminderBoost = task.getReminderAt() != null && task.getReminderAt().toLocalDate().equals(LocalDate.now()) ? 10 : 0;
        int effortBoost = task.getEstimatedMinutes() <= 30 ? 8 : task.getEstimatedMinutes() <= 90 ? 4 : 0;
        int recurrenceBoost = task.getRecurrence() == Recurrence.NONE ? 0 : 4;
        return Math.min(100, urgency + importance + reminderBoost + effortBoost + recurrenceBoost);
    }

    public String reason(Task task) {
        if (task.isCompleted()) {
            return "completed tasks do not need priority attention";
        }
        long daysLeft = ChronoUnit.DAYS.between(LocalDate.now(), task.getDeadline());
        String deadline = daysLeft < 0 ? "deadline has passed"
                : daysLeft == 0 ? "deadline is today"
                : daysLeft == 1 ? "deadline is tomorrow"
                : "deadline is in " + daysLeft + " days";
        String effort = task.getEstimatedMinutes() <= 30 ? " and it is quick to finish" : "";
        return deadline + " and importance is " + task.getImportance() + "/5" + effort;
    }

    public AlertLevel alertLevel(Task task) {
        if (task.isCompleted()) {
            return AlertLevel.NONE;
        }
        if (task.getDeadline().isBefore(LocalDate.now())) {
            return AlertLevel.OVERDUE;
        }
        if (task.getDeadline().isEqual(LocalDate.now())) {
            return AlertLevel.DUE_TODAY;
        }
        if (task.getReminderAt() != null
                && !task.isReminderAcknowledged()
                && !task.getReminderAt().isAfter(LocalDateTime.now())) {
            return AlertLevel.REMINDER;
        }
        return AlertLevel.NONE;
    }
}
