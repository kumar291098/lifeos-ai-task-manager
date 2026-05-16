package com.lifeos.taskmanager.task;

public record AnalyticsResponse(
        long totalTasks,
        long openTasks,
        long completedTasks,
        long overdueTasks,
        int completionRate,
        int remainingFocusMinutes,
        String bestNextAction
) {
}
