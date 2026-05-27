package com.lifeos.taskmanager.task;

import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.NotBlank;
import org.hibernate.validator.constraints.URL;

@Embeddable
public class TaskLink {
    @NotBlank
    private String label;

    @NotBlank
    @URL
    private String url;

    protected TaskLink() {
    }

    public TaskLink(String label, String url) {
        this.label = label;
        this.url = url;
    }

    public String getLabel() {
        return label;
    }

    public String getUrl() {
        return url;
    }
}
