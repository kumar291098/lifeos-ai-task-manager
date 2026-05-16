# LifeOS AI Task Manager

Full-stack smart task manager built with Spring Boot and React.

## Folders

- `backend/` - Spring Boot REST API, H2 database, AI-style priority engine, planner, alerts, analytics
- `frontend/` - React + TypeScript dashboard for tasks, drag/drop ordering, planner, reminders, and analytics

## Backend

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

API base URL: `http://localhost:8081/api`

Useful endpoints:

- `GET /api/dashboard`
- `GET /api/tasks`
- `POST /api/tasks`
- `PUT /api/tasks/{id}`
- `PATCH /api/tasks/{id}/complete`
- `POST /api/tasks/reorder`
- `GET /api/planner/today`
- `GET /api/analytics`

## Frontend

```powershell
cd frontend
npm.cmd install
npm.cmd run dev
```

App URL: `http://localhost:5173`

## Verify

```powershell
cd backend
.\mvnw.cmd test

cd ..\frontend
npm.cmd run build
```
