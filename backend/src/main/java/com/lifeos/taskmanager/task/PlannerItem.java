package com.lifeos.taskmanager.task;

import java.time.LocalTime;

public record PlannerItem(
        LocalTime startTime,
        LocalTime endTime,
        TaskResponse task
) {
}
