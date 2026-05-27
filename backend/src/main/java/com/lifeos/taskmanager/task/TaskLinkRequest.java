package com.lifeos.taskmanager.task;

import jakarta.validation.constraints.NotBlank;
import org.hibernate.validator.constraints.URL;

public record TaskLinkRequest(
        @NotBlank String label,
        @NotBlank @URL String url
) {
    TaskLink toEntity() {
        return new TaskLink(label.trim(), url.trim());
    }
}
