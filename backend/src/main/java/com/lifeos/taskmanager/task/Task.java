package com.lifeos.taskmanager.task;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OrderColumn;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
public class Task {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String title;

    private String notes;

    @Valid
    @ElementCollection
    @CollectionTable(name = "task_links", joinColumns = @JoinColumn(name = "task_id"))
    @OrderColumn(name = "link_order")
    private List<TaskLink> links = new ArrayList<>();

    @Min(1)
    @Max(5)
    private int importance;

    @NotNull
    private LocalDate deadline;

    private LocalDateTime reminderAt;

    @Enumerated(EnumType.STRING)
    private Recurrence recurrence = Recurrence.NONE;

    @Min(5)
    private int estimatedMinutes;

    private boolean completed;
    private LocalDateTime completedAt;
    private boolean reminderAcknowledged;
    private int manualOrder;

    protected Task() {
    }

    public Task(String title, String notes, List<TaskLink> links, int importance, LocalDate deadline,
                LocalDateTime reminderAt, Recurrence recurrence, int estimatedMinutes, int manualOrder) {
        this.title = title;
        this.notes = notes;
        this.links = new ArrayList<>(links == null ? List.of() : links);
        this.importance = importance;
        this.deadline = deadline;
        this.reminderAt = reminderAt;
        this.recurrence = recurrence == null ? Recurrence.NONE : recurrence;
        this.estimatedMinutes = estimatedMinutes;
        this.manualOrder = manualOrder;
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getNotes() {
        return notes;
    }

    public List<TaskLink> getLinks() {
        return List.copyOf(links);
    }

    public int getImportance() {
        return importance;
    }

    public LocalDate getDeadline() {
        return deadline;
    }

    public LocalDateTime getReminderAt() {
        return reminderAt;
    }

    public Recurrence getRecurrence() {
        return recurrence;
    }

    public int getEstimatedMinutes() {
        return estimatedMinutes;
    }

    public boolean isCompleted() {
        return completed;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public boolean isReminderAcknowledged() {
        return reminderAcknowledged;
    }

    public int getManualOrder() {
        return manualOrder;
    }

    public void updateFrom(TaskRequest request) {
        title = request.title();
        notes = request.notes();
        links.clear();
        links.addAll(request.toLinks());
        importance = request.importance();
        deadline = request.deadline();
        reminderAt = request.reminderAt();
        recurrence = request.recurrence();
        estimatedMinutes = request.estimatedMinutes();
        reminderAcknowledged = false;
    }

    public void complete() {
        completed = true;
        completedAt = LocalDateTime.now();
    }

    public void setCompletedForSeed(boolean completed, LocalDateTime completedAt) {
        this.completed = completed;
        this.completedAt = completedAt;
    }

    public Task nextOccurrence(int order) {
        LocalDate nextDeadline = switch (recurrence) {
            case DAILY -> deadline.plusDays(1);
            case WEEKLY -> deadline.plusWeeks(1);
            case MONTHLY -> deadline.plusMonths(1);
            case NONE -> deadline;
        };
        LocalDateTime nextReminder = reminderAt == null ? null : switch (recurrence) {
            case DAILY -> reminderAt.plusDays(1);
            case WEEKLY -> reminderAt.plusWeeks(1);
            case MONTHLY -> reminderAt.plusMonths(1);
            case NONE -> reminderAt;
        };
        return new Task(title, notes, links, importance, nextDeadline, nextReminder, recurrence, estimatedMinutes, order);
    }

    public void acknowledgeReminder() {
        reminderAcknowledged = true;
    }

    public void setManualOrder(int manualOrder) {
        this.manualOrder = manualOrder;
    }
}
