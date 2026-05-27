package com.lifeos.taskmanager.task;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record TaskResponse(
        Long id,
        String title,
        String notes,
        List<TaskLinkResponse> links,
        int importance,
        LocalDate deadline,
        LocalDateTime reminderAt,
        Recurrence recurrence,
        int estimatedMinutes,
        boolean completed,
        LocalDateTime completedAt,
        int manualOrder,
        int aiScore,
        String aiReason,
        AlertLevel alertLevel
) {
    static TaskResponse from(Task task, PriorityEngine engine) {
        return new TaskResponse(
                task.getId(),
                task.getTitle(),
                task.getNotes(),
                task.getLinks().stream().map(TaskLinkResponse::from).toList(),
                task.getImportance(),
                task.getDeadline(),
                task.getReminderAt(),
                task.getRecurrence(),
                task.getEstimatedMinutes(),
                task.isCompleted(),
                task.getCompletedAt(),
                task.getManualOrder(),
                engine.score(task),
                engine.reason(task),
                engine.alertLevel(task)
        );
    }
}
