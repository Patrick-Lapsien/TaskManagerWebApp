# Task Manager

Minimal Task Manager Web App (Express backend + static frontend).

## Run (Windows PowerShell)

Open a PowerShell terminal in the project root (`/workspace/task-manager`) and run:

```powershell
npm install
npm start
```

This starts the server on `http://localhost:3000`. Open that URL in a browser to use the app.

## Scripts

- `npm start` — run production server (`node server.js`).
- `npm run dev` — run with `nodemon` (if installed) for development.

## Notes & Next Steps

- Data is stored in-memory; restart clears tasks. Add a DB (SQLite/Postgres) for persistence.
- Consider adding authentication, task due dates, filtering and search.
- I can initialize a Git repo, add a Dockerfile, or switch to a separate frontend build (React/Vite) if you want.
