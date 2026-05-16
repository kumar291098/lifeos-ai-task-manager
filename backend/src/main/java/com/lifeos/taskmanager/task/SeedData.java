package com.lifeos.taskmanager.task;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
public class SeedData implements CommandLineRunner {
    private final TaskRepository repository;

    public SeedData(TaskRepository repository) {
        this.repository = repository;
    }

    @Override
    public void run(String... args) {
        if (repository.count() > 0) {
            return;
        }
        repository.save(new Task(
                "Ship smart planner MVP",
                "Finish the first backend plus React workflow.",
                5,
                LocalDate.now().plusDays(1),
                LocalDateTime.now().plusHours(2),
                Recurrence.NONE,
                90,
                1
        ));
        repository.save(new Task(
                "Review learning goals",
                "Daily reflection and next action planning.",
                3,
                LocalDate.now(),
                LocalDateTime.now().plusHours(1),
                Recurrence.DAILY,
                25,
                2
        ));
        repository.save(new Task(
                "Prepare productivity analytics demo",
                "Make sure charts and metrics are ready to show.",
                4,
                LocalDate.now().plusDays(3),
                null,
                Recurrence.WEEKLY,
                60,
                3
        ));
    }
}
