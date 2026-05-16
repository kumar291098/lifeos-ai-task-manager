package com.lifeos.taskmanager.task;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Comparator;
import java.util.List;

@Service
public class TaskService {
    private final TaskRepository repository;
    private final PriorityEngine priorityEngine;

    public TaskService(TaskRepository repository, PriorityEngine priorityEngine) {
        this.repository = repository;
        this.priorityEngine = priorityEngine;
    }

    public DashboardResponse dashboard() {
        List<TaskResponse> tasks = findAll();
        TaskResponse recommendation = tasks.stream()
                .filter(task -> !task.completed())
                .max(Comparator.comparingInt(TaskResponse::aiScore))
                .orElse(null);
        return new DashboardResponse(tasks, recommendation, dailyPlan(), analytics(), alerts());
    }

    public List<TaskResponse> findAll() {
        return repository.findAllByOrderByCompletedAscManualOrderAscDeadlineAsc()
                .stream()
                .map(task -> TaskResponse.from(task, priorityEngine))
                .toList();
    }

    @Transactional
    public TaskResponse create(TaskRequest request) {
        int order = repository.findAll().stream().mapToInt(Task::getManualOrder).max().orElse(0) + 1;
        Task task = new Task(request.title(), request.notes(), request.importance(), request.deadline(),
                request.reminderAt(), request.recurrence(), request.estimatedMinutes(), order);
        return TaskResponse.from(repository.save(task), priorityEngine);
    }

    @Transactional
    public TaskResponse update(Long id, TaskRequest request) {
        Task task = get(id);
        task.updateFrom(request);
        return TaskResponse.from(task, priorityEngine);
    }

    @Transactional
    public TaskResponse complete(Long id) {
        Task task = get(id);
        task.complete();
        if (task.getRecurrence() != Recurrence.NONE) {
            int order = repository.findAll().stream().mapToInt(Task::getManualOrder).max().orElse(0) + 1;
            repository.save(task.nextOccurrence(order));
        }
        return TaskResponse.from(task, priorityEngine);
    }

    @Transactional
    public void delete(Long id) {
        repository.delete(get(id));
    }

    @Transactional
    public List<TaskResponse> reorder(ReorderRequest request) {
        List<Task> tasks = repository.findAll();
        for (int i = 0; i < request.orderedIds().size(); i++) {
            Long id = request.orderedIds().get(i);
            int order = i + 1;
            tasks.stream()
                    .filter(task -> task.getId().equals(id))
                    .findFirst()
                    .ifPresent(task -> task.setManualOrder(order));
        }
        return findAll();
    }

    @Transactional
    public TaskResponse acknowledgeReminder(Long id) {
        Task task = get(id);
        task.acknowledgeReminder();
        return TaskResponse.from(task, priorityEngine);
    }

    public List<PlannerItem> dailyPlan() {
        LocalTime cursor = LocalTime.of(9, 0);
        List<TaskResponse> plannedTasks = repository.findAllByOrderByCompletedAscManualOrderAscDeadlineAsc().stream()
                .filter(task -> !task.isCompleted())
                .sorted(Comparator.comparingInt(priorityEngine::score).reversed())
                .limit(7)
                .map(task -> TaskResponse.from(task, priorityEngine))
                .toList();

        java.util.ArrayList<PlannerItem> plan = new java.util.ArrayList<>();
        for (TaskResponse task : plannedTasks) {
            LocalTime end = cursor.plusMinutes(task.estimatedMinutes());
            plan.add(new PlannerItem(cursor, end, task));
            cursor = end.plusMinutes(15);
        }
        return plan;
    }

    public AnalyticsResponse analytics() {
        List<Task> tasks = repository.findAll();
        long total = tasks.size();
        long completed = tasks.stream().filter(Task::isCompleted).count();
        long open = total - completed;
        long overdue = tasks.stream()
                .filter(task -> !task.isCompleted() && task.getDeadline().isBefore(LocalDate.now()))
                .count();
        int remainingMinutes = tasks.stream()
                .filter(task -> !task.isCompleted())
                .mapToInt(Task::getEstimatedMinutes)
                .sum();
        int completionRate = total == 0 ? 0 : (int) Math.round(completed * 100.0 / total);
        String bestNext = tasks.stream()
                .filter(task -> !task.isCompleted())
                .max(Comparator.comparingInt(priorityEngine::score))
                .map(Task::getTitle)
                .orElse("All clear");
        return new AnalyticsResponse(total, open, completed, overdue, completionRate, remainingMinutes, bestNext);
    }

    public List<TaskResponse> alerts() {
        return repository.findAll().stream()
                .filter(task -> priorityEngine.alertLevel(task) != AlertLevel.NONE)
                .map(task -> TaskResponse.from(task, priorityEngine))
                .toList();
    }

    private Task get(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Task not found: " + id));
    }
}
