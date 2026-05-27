package com.lifeos.taskmanager.task;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Component
public class SeedData implements CommandLineRunner {
    private final TaskRepository repository;

    public SeedData(TaskRepository repository) {
        this.repository = repository;
    }

    @Override
    public void run(String... args) {
        repository.deleteAll();

        // --- Active Tasks ---
        repository.save(new Task(
                "Prepare API Spec release doc",
                "Update Swagger docs and publish endpoints to the internal team wiki.",
                List.of(new TaskLink("Wiki Specs", "https://github.com/")),
                4,
                LocalDate.now().plusDays(1),
                LocalDateTime.now().plusHours(3),
                Recurrence.NONE,
                45,
                1
        ));

        repository.save(new Task(
                "Cardio workout & stretches",
                "Run 5k around the park and complete 15 minutes of cool-down stretching.",
                List.of(),
                3,
                LocalDate.now(),
                LocalDateTime.now().plusHours(1),
                Recurrence.DAILY,
                50,
                2
        ));

        repository.save(new Task(
                "Study Spring Boot security filters",
                "Understand the delegation filter proxy chain and OAuth2 config adapters.",
                List.of(new TaskLink("Spring Docs", "https://spring.io/")),
                5,
                LocalDate.now().plusDays(2),
                null,
                Recurrence.WEEKLY,
                120,
                3
        ));

        repository.save(new Task(
                "Buy organic groceries",
                "Pick up fresh vegetables, spinach, eggs, whole grains, and nuts.",
                List.of(),
                2,
                LocalDate.now().plusDays(3),
                null,
                Recurrence.NONE,
                30,
                4
        ));

        // --- Completed Tasks (Spread over last 7 days for visual analytics charts) ---
        LocalDateTime now = LocalDateTime.now();

        // 6 days ago (Learning)
        Task t1 = new Task(
                "Read Clean Architecture Chapter 1",
                "Introduction to architecture design principles and clean structures.",
                List.of(),
                3,
                LocalDate.now().minusDays(6),
                null,
                Recurrence.NONE,
                45,
                5
        );
        t1.setCompletedForSeed(true, now.minusDays(6));
        repository.save(t1);

        // 5 days ago (Personal)
        Task t2 = new Task(
                "Clean workspace and study desk",
                "De-clutter cables, organize notebooks, and wipe down monitors.",
                List.of(),
                2,
                LocalDate.now().minusDays(5),
                null,
                Recurrence.NONE,
                20,
                6
        );
        t2.setCompletedForSeed(true, now.minusDays(5));
        repository.save(t2);

        // 4 days ago (Work)
        Task t3 = new Task(
                "Build basic frontend framework",
                "Set up React 19 shell, TypeScript templates, and global router rules.",
                List.of(new TaskLink("Repo Link", "https://github.com/")),
                5,
                LocalDate.now().minusDays(4),
                null,
                Recurrence.NONE,
                90,
                7
        );
        t3.setCompletedForSeed(true, now.minusDays(4));
        repository.save(t3);

        // 3 days ago (Health)
        Task t4 = new Task(
                "Reflect and meditate for 15m",
                "Calm-down breathing exercise to improve clarity and stress management.",
                List.of(),
                4,
                LocalDate.now().minusDays(3),
                null,
                Recurrence.DAILY,
                15,
                8
        );
        t4.setCompletedForSeed(true, now.minusDays(3));
        repository.save(t4);

        // 2 days ago (Work)
        Task t5 = new Task(
                "Deploy Postgres Docker container",
                "Configure PostgreSQL container, mount local volumes, and map database ports.",
                List.of(),
                4,
                LocalDate.now().minusDays(2),
                null,
                Recurrence.NONE,
                30,
                9
        );
        t5.setCompletedForSeed(true, now.minusDays(2));
        repository.save(t5);

        // 2 days ago (Health)
        Task t6 = new Task(
                "Morning outdoor jogging session",
                "Boost cardiovascular health and oxygen levels.",
                List.of(),
                3,
                LocalDate.now().minusDays(2),
                null,
                Recurrence.DAILY,
                40,
                10
        );
        t6.setCompletedForSeed(true, now.minusDays(2));
        repository.save(t6);

        // 1 day ago (Learning)
        Task t7 = new Task(
                "Review design patterns catalog",
                "Study Singleton, Factory Method, and Observer structural patterns in detail.",
                List.of(new TaskLink("Refactoring Guru", "https://refactoring.guru/")),
                4,
                LocalDate.now().minusDays(1),
                null,
                Recurrence.NONE,
                60,
                11
        );
        t7.setCompletedForSeed(true, now.minusDays(1));
        repository.save(t7);

        // Today (Work)
        Task t8 = new Task(
                "Collect feedback on task UI demo",
                "Review initial design system proposal with pair programmer.",
                List.of(),
                5,
                LocalDate.now(),
                null,
                Recurrence.NONE,
                30,
                12
        );
        t8.setCompletedForSeed(true, now);
        repository.save(t8);
    }
}
