# Startup-Dashboard — PLAN.md
_Approved plan. Update only if scope or approach changes. Progress tracking goes in STATUS.md._

## What We're Building
**Prosper with Em** — a private internal CRM for Emilia's finance coaching business. Not client-facing. Replaces the old unified dashboard.

## Tech Stack
- Next.js (App Router) + TypeScript — already scaffolded
- Supabase — existing schema, needs migration
- Tailwind CSS — needs Prosper brand tokens added
- Vercel — deployment target

---

## Phase 1 — Design (Stitch) ✅ COMPLETE
All 7 screens locked. Full specs in `design/stitch-prompts.md`.

**Screens:**
1. Home — daily overview (meetings, tasks, stats)
2. Clients — kanban pipeline board
3. Client Detail — tabbed drill-through (Overview, Activity, Meetings, Tasks)
4. Meetings — list + calendar toggle, Google Calendar sync
5. Milestones — business goals with nested projects/tasks
6. Projects — standalone + milestone-linked
7. Tasks — standalone + milestone/project/client linked

**Design system (all screens):**
- Top bar: "Prosper with Em ▾" business switcher left · Search icon + avatar right
- Left sidebar: deep burgundy `#640015` · Nav: Home, Clients, Meetings, Milestones, Projects, Tasks · Settings icon bottom
- Colors: cream `#F7F1ED` · burgundy `#640015` · rose `#AB655C` · gray `#4D4D4D`
- Fonts: Noto Serif (headings) · Manrope (body)

---

## Phase 2 — Database Migration ✅ COMPLETE
File: `schema/phase3-prosper.sql` (applied 2026-05-22)

Changes:
1. Update `clients.lead_stage` CHECK → `lead | discovery | active | paused | cold`
2. Migrate existing rows to new stage values
3. Create `projects` table with milestone + client associations
4. Add `tasks.project_id` FK (nullable)
5. Add `tasks.milestone_id` FK (nullable)
6. Add `projects.milestone_id` FK (nullable)

---

## Phase 3 — Code Setup ✅ COMPLETE
1. Update `lib/constants.ts` — new pipeline stages, service types
2. Update `lib/validations.ts` — new schema shapes
3. Update `tailwind.config.ts` — Prosper brand tokens
4. Update global CSS — Noto Serif + Manrope font imports
5. Strip dead Consulting code paths

---

## Phase 4 — Screen Builds ✅ COMPLETE
Build in this order (each screen = API routes + UI components):

1. **Home** — stat counts, today's meetings, today's tasks
2. **Clients kanban** — drag-drop pipeline, attention indicators, service pills
3. **Client Detail** — tabbed layout, all CRUD
4. **Meetings** — list + calendar, Google Calendar sync
5. **Milestones** — nested projects/tasks, progress tracking
6. **Projects** — standalone + milestone-linked
7. **Tasks** — standalone + all associations

---

## Phase 5 — Deploy ✅ COMPLETE
1. ✅ Build verified clean (tsc + next build)
2. ✅ Vercel preview deploy → tested
3. ✅ Production deploy — live at https://startup-dashboard-five.vercel.app

---

## Phase 6 — Google Calendar Integration ✅ COMPLETE
1. ✅ Built `lib/google.ts` — token storage, refresh, CRUD, sync helpers
2. ✅ Built OAuth routes: `/api/auth/google/connect`, `/callback`, `/disconnect`, `/status`
3. ✅ Built `/api/calendar/event` (create/update/delete) and `/api/calendar/sync` (pull from Google)
4. ✅ Wired MeetingForm + MeetingCard to push/delete events on save/delete
5. ✅ Applied DB migrations: `schema/phase4-service-type.sql` + `schema/phase6-google-calendar.sql`
6. ✅ Google Cloud project created, Calendar API enabled, OAuth 2.0 credentials issued
7. ✅ Vercel env vars set: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`
8. ✅ Deployed to production — OAuth flow confirmed working end to end

---

## Key Constraints
- **Prosper-only for v1** — no consulting tracker
- **Internal tool only** — no auth beyond Emilia's login
- **Google Calendar sync** — fully active; Emilia's account connected via OAuth
- **No paid services** without asking first
