# LifeOS AI Task Manager

A full-stack task manager with a Spring Boot + PostgreSQL backend and a React + TypeScript frontend. Tasks include AI-style priority scoring, reminders, recurring tasks, drag/drop ordering, analytics, daily planning, and saved resource links so important URLs stay one click away.

## Stack

- Backend: Java 21, Spring Boot, Spring Data JPA, Bean Validation, PostgreSQL
- Frontend: React 19, Vite, TypeScript, Ant Design, Lucide icons
- Test database: H2 for backend tests

## Project Structure

```text
backend/
  src/main/java/com/lifeos/taskmanager/
    config/                 CORS configuration
    task/                   Task domain, DTOs, service, controller, priority engine
frontend/
  src/
    api/                    Typed API client
    components/             Shared UI components
    features/               Dashboard and task feature components
    hooks/                  Reusable data hooks
    lib/                    Theme and form helpers
    styles/colors.css       Global color tokens
    types/                  Shared TypeScript models
```

## PostgreSQL Setup

Create a local database that matches `backend/src/main/resources/application.properties`.

```sql
CREATE DATABASE ai_task_manager;
```

Default local connection:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/ai_task_manager
spring.datasource.username=postgres
spring.datasource.password=root
```

Hibernate is set to `spring.jpa.hibernate.ddl-auto=update`, so the `task` and `task_links` tables are created/updated when the backend starts.

## Run The App

Start the backend:

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

Start the frontend in another terminal:

```powershell
cd frontend
npm.cmd install
npm.cmd run dev
```

Open `http://localhost:5173`. The API runs at `http://localhost:8081/api`.

## Useful API Calls

```http
GET    /api/dashboard
GET    /api/tasks
POST   /api/tasks
PUT    /api/tasks/{id}
PATCH  /api/tasks/{id}/complete
PATCH  /api/tasks/{id}/acknowledge-reminder
POST   /api/tasks/reorder
DELETE /api/tasks/{id}
GET    /api/planner/today
GET    /api/analytics
```

Task create/update payload with links:

```json
{
  "title": "Prepare release notes",
  "notes": "Collect screenshots and final checks.",
  "links": [
    { "label": "Release board", "url": "https://example.com/releases" },
    { "label": "Design QA", "url": "https://example.com/design" }
  ],
  "importance": 4,
  "deadline": "2026-05-20",
  "reminderAt": "2026-05-20T09:30",
  "recurrence": "NONE",
  "estimatedMinutes": 45
}
```

## Verify

```powershell
cd backend
.\mvnw.cmd test

cd ..\frontend
npm.cmd run build
```

## Design Notes

- Ant Design provides accessible form, alert, button, card, select, statistic, and layout primitives.
- `frontend/src/styles/colors.css` owns the global light/dark color tokens.
- Feature code is grouped by domain so new dashboard panels or task workflows can be added without repeating API/form/list logic.
