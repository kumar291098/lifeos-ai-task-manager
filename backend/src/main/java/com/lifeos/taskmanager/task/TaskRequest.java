package com.lifeos.taskmanager.task;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record TaskRequest(
        @NotBlank String title,
        String notes,
        List<@jakarta.validation.Valid TaskLinkRequest> links,
        @Min(1) @Max(5) int importance,
        @NotNull LocalDate deadline,
        LocalDateTime reminderAt,
        @NotNull Recurrence recurrence,
        @Min(5) int estimatedMinutes
) {
    List<TaskLink> toLinks() {
        return links == null ? List.of() : links.stream()
                .map(TaskLinkRequest::toEntity)
                .toList();
    }
}
