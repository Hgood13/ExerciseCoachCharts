# ExerciseCoachCharts

A digital workout chart management tool for **The Exercise Coach** gym. Coaches log in and manage client profiles with session-by-session exercise tracking — a paperless replacement for the gym's physical workout charts.

---

## Features

- **Client management** — search, filter, and navigate a full client roster
- **Workout charts** — 16 exercises × 14 sessions per chart, with sliding session window
- **Routine A / B** — each client has two exercise routines that alternate each session
- **Per-session data** — date, trainer, routine selection, checkbox completions, and notes
- **Auto-save** — changes are debounced and saved to Supabase automatically (4-second delay)
- **Multiple records** — a client can have multiple historical charts (record numbers)
- **Exercise library** — sidebar panel with exercises grouped by equipment type
- **Authentication** — email/password login with Supabase Auth; all routes are protected

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 |
| Routing | React Router v6 |
| Build Tool | Vite 6 |
| Backend / DB | Supabase (PostgreSQL + Auth) |
| Error Tracking | Sentry (`@sentry/react`) |
| Deployment | Vercel |

---

## Project Structure

```
src/
  App.jsx                  # Auth bootstrap, routing, ProtectedRoute
  main.jsx                 # React entry point
  index.css                # Global styles
  components/
    Header.jsx             # Logo, title, sign-out button
    ClientInfoCard.jsx     # Goals, injuries, protocol textareas
    WorkoutGrid.jsx        # Main 16×14 session tracking grid
    RoutineGrid.jsx        # Routine A/B exercise name editor
    WorkoutOptions.jsx     # Exercise library sidebar
  pages/
    LoginPage.jsx          # Email/password sign-in
    ClientsPage.jsx        # Client list with search and A–Z filter
    AddClientPage.jsx      # New client form (auto-derives PIN from phone)
    ClientPage.jsx         # Client detail, chart viewing, editing, saving
  services/
    supabase.js            # Supabase client (reads env vars)
    clientService.js       # All database operations
  data/
    clients.js             # Legacy stub — not in active use
```

---

## Database Schema

| Table | Key Columns |
|---|---|
| `clients` | `id`, `name`, `pin`, `phone_number`, `goals`, `injuries`, `protocol` |
| `charts` | `id`, `client_id`, `record_number` |
| `chart_sessions` | `chart_id`, `session_index`, `date`, `trainer`, `routine` |
| `chart_exercises` | `chart_id`, `exercise_index`, `routine_a`, `routine_b` |
| `chart_session_exercises` | `chart_id`, `session_index`, `exercise_index`, `checked`, `note` |
| `exercise_definitions` | `id`, `code`, `name`, `category` |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project with the schema above

### Environment Variables

Create a `.env` file in the project root:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SENTRY_DSN=https://your-sentry-dsn
```

### Install & Run

```bash
npm install
npm run dev
```

### Build

```bash
npm run build
```
or for dev
```bash
npm run deev
```

---

## Deployment

The app is deployed on **Vercel**. The `vercel.json` config rewrites all routes to `index.html` for SPA client-side routing:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

Set the environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_SENTRY_DSN`) in your Vercel project settings.
