package com.lifeos.taskmanager.task;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class TaskController {
    private final TaskService service;

    public TaskController(TaskService service) {
        this.service = service;
    }

    @GetMapping("/dashboard")
    public DashboardResponse dashboard() {
        return service.dashboard();
    }

    @GetMapping("/tasks")
    public List<TaskResponse> tasks() {
        return service.findAll();
    }

    @PostMapping("/tasks")
    public TaskResponse create(@Valid @RequestBody TaskRequest request) {
        return service.create(request);
    }

    @PutMapping("/tasks/{id}")
    public TaskResponse update(@PathVariable Long id, @Valid @RequestBody TaskRequest request) {
        return service.update(id, request);
    }

    @PatchMapping("/tasks/{id}/complete")
    public TaskResponse complete(@PathVariable Long id) {
        return service.complete(id);
    }

    @PatchMapping("/tasks/{id}/acknowledge-reminder")
    public TaskResponse acknowledgeReminder(@PathVariable Long id) {
        return service.acknowledgeReminder(id);
    }

    @PostMapping("/tasks/reorder")
    public List<TaskResponse> reorder(@Valid @RequestBody ReorderRequest request) {
        return service.reorder(request);
    }

    @DeleteMapping("/tasks/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/planner/today")
    public List<PlannerItem> planner() {
        return service.dailyPlan();
    }

    @GetMapping("/analytics")
    public AnalyticsResponse analytics() {
        return service.analytics();
    }
}
