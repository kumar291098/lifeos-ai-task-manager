package com.lifeos.taskmanager.task;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record TaskRequest(
        @NotBlank String title,
        String notes,
        @Min(1) @Max(5) int importance,
        @NotNull LocalDate deadline,
        LocalDateTime reminderAt,
        @NotNull Recurrence recurrence,
        @Min(5) int estimatedMinutes
) {
}
