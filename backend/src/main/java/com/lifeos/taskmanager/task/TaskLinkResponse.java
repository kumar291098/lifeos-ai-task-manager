package com.lifeos.taskmanager.task;

public record TaskLinkResponse(
        String label,
        String url
) {
    static TaskLinkResponse from(TaskLink link) {
        return new TaskLinkResponse(link.getLabel(), link.getUrl());
    }
}
