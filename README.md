# Em's Startup Dashboard

A personal dashboard for tracking **Prosper with Em** and **AI Automation Consulting** — built on your existing Supabase Startup Tracker.

## What it shows
- **Overview** — stats at a glance, open tasks, upcoming milestones
- **Tasks** — per-startup task list with status and priority
- **Milestones** — upcoming and completed milestones with countdown
- **Clients** — client roster by status
- **Meetings** — upcoming and past meetings
- **Notes** — all notes per startup

---

## Deploy to Vercel (5 steps)

### 1. Push this folder to GitHub
Create a new GitHub repo (can be private), push this folder to it.

```bash
cd startup-dashboard
git init
git add .
git commit -m "initial dashboard"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### 2. Import to Vercel
1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Connect your GitHub account if needed
3. Select the repo you just created
4. Click **Deploy** (Vercel auto-detects Next.js)

### 3. Add environment variables in Vercel
In your Vercel project → **Settings → Environment Variables**, add:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://YOUR_PROJECT_REF.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your anon key |

Get these from: **Supabase Dashboard → Project Settings → API**

### 4. Redeploy
After adding the env vars: **Deployments → Redeploy** (or push any commit).

### 5. Done
Vercel gives you a URL like `your-project.vercel.app`. Bookmark it.

---

## Run locally (optional)

```bash
npm install
cp .env.example .env.local
# Fill in .env.local with your Supabase credentials
npm run dev
# Open http://localhost:3000
```

---

## Adding data
All data entry still happens via Claude. Say things like:
- "Add a task to Prosper with Em: draft email to Penelope, high priority, due Friday"
- "Log a meeting with Morgan for April 25"
- "Add a milestone: first $1k month, target June 1"

The dashboard refreshes and shows it automatically.
