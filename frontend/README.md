# Frontend

React + TypeScript dashboard for LifeOS AI Task Manager.

The UI uses Ant Design as the React component library and Lucide React for action icons.

## Commands

```powershell
npm.cmd install
npm.cmd run dev
npm.cmd run build
npm.cmd run lint
```

## Environment

The frontend uses `VITE_API_URL` when provided, otherwise it calls:

```text
http://localhost:8081/api
```

Example `.env.local`:

```properties
VITE_API_URL=http://localhost:8081/api
```

## Code Map

- `src/api/tasks.ts` - API adapter and payload cleanup
- `src/hooks/useDashboard.ts` - dashboard loading state and derived task lists
- `src/features/tasks/` - task form, active list, completed list
- `src/features/dashboard/` - recommendation, planner, analytics panels
- `src/components/` - reusable visual primitives
- `src/styles/colors.css` - global design tokens for light and dark themes

## Link Workflow

Each task can store multiple named links. Add a label and URL in the task form, save, then use the link chips on the active task card to open resources in a new tab.
