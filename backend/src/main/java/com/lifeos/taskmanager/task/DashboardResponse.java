package com.lifeos.taskmanager.task;

import java.util.List;

public record DashboardResponse(
        List<TaskResponse> tasks,
        TaskResponse recommendation,
        List<PlannerItem> dailyPlan,
        AnalyticsResponse analytics,
        List<TaskResponse> alerts
) {
}
