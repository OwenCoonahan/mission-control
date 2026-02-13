# Mission Control — Design Plan

## What It Should Actually Do

This isn't a pretty dashboard to look at. It's **Owen's command center** for running his life and business, with Sir Henry as the engine underneath.

### Core Requirements

1. **Everything must be functional** — no fake buttons, no mock data
2. **Real-time integration** with OpenClaw/workspace data
3. **Actually help Owen** — track goals, manage tasks, surface insights
4. **Clean, usable UI** — not over-designed, just works

---

## Pages/Views

### 1. **Dashboard (Home)**
- Today's date, greeting, weather
- **Today's Focus** — The FROG + 1-3-5 tasks
- **Goals Progress** — 3 core goals with real progress tracking
- **Quick Stats** — Tasks done this week, streak, upcoming deadlines
- **Recent Activity** — Last 10 things Henry did (from logs)
- **Quick Actions** — Add task, start focus session, check calendar

### 2. **Tasks**
- **Kanban board** — Backlog → Today → In Progress → Done
- Drag-and-drop functionality
- Quick-add task inline
- Filter by goal, priority, date
- Tasks persist to `planning/tasks.json` or similar
- Click task to edit/view details

### 3. **Goals**
- The 3 core goals with:
  - Current progress (editable)
  - Key results / milestones
  - Linked tasks
  - Trend chart (weekly progress)
- Add/edit goals

### 4. **Calendar** (Phase 2)
- Weekly/daily view
- Pull from Google Calendar (gog skill)
- Show deadlines from tasks
- Quick event creation

### 5. **Memory/Docs**
- Browse memory/ folder
- Quick view/edit markdown files
- Search across workspace
- Recent files

### 6. **Activity Log**
- Full history of Henry's actions
- Filter by type (tasks, memory, cron, etc.)
- Searchable

### 7. **Settings**
- Edit profile info
- Cron job management
- OpenClaw status

---

## Data Architecture

### Where data lives:
```
/workspace/
├── planning/
│   ├── tasks.json          # All tasks
│   ├── goals.json          # Goals + progress
│   └── PRIORITIES.md       # Human-readable priorities
├── memory/
│   └── *.md                # Daily notes, insights
├── MEMORY.md               # Long-term memory
└── mission-control/
    └── data/
        └── activity.json   # Activity log
```

### API Routes (Next.js):
- `GET/POST /api/tasks` — CRUD tasks
- `GET/POST /api/goals` — CRUD goals  
- `GET /api/activity` — Read activity log
- `GET /api/memory` — List/read memory files
- `POST /api/memory` — Update memory files

### Real-time:
- Poll every 30s for activity updates
- Or use file watchers if we want true real-time

---

## Tech Stack

- **Next.js 16** (already set up)
- **Tailwind CSS** (already set up)
- **shadcn/ui** (already installed)
- **File-based storage** (JSON/MD in workspace)
- **No external DB needed** — everything in the workspace

---

## Build Phases

### Phase 1: Foundation (Today)
- [ ] Set up data files (tasks.json, goals.json)
- [ ] Build API routes
- [ ] Working sidebar navigation
- [ ] Dashboard with real data
- [ ] Tasks page with working kanban

### Phase 2: Polish
- [ ] Goals page with progress tracking
- [ ] Memory browser
- [ ] Activity log
- [ ] Drag-and-drop tasks

### Phase 3: Integrations
- [ ] Calendar (Google)
- [ ] Cron job management
- [ ] Real-time activity from Henry

---

## UI Principles

1. **Dark theme** — easy on the eyes, matches Owen's preference
2. **Information density** — show what matters, hide what doesn't
3. **Speed** — everything loads fast, no spinners for local data
4. **Keyboard shortcuts** — power user friendly
5. **Mobile responsive** — works on phone too

---

## Design Reference

Inspired by:
- Linear (task management)
- Notion (clean, functional)
- Arc (sidebar navigation)
- The Alex Finn Mission Control (agent activity feed)

**NOT trying to be:**
- Over-animated
- Cluttered with charts
- A generic admin dashboard

---

## Next Steps

1. Review this plan with Owen
2. Get feedback on priorities
3. Build Phase 1 properly
4. Test everything works
5. Deploy

---

*This is a tool, not a decoration.*
