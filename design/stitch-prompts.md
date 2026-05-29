# Prosper with Em — Stitch Screen Prompts
_Last updated: 2026-05-20_

---

## HOW TO USE THESE PROMPTS

1. **Home screen** is locked. Do not regenerate it.
2. For every other screen: **duplicate the Home screen** in Stitch, then paste the relevant prompt below as an Edit. This preserves the top bar and sidebar exactly.
3. Only replace the main content area — never touch the top bar or sidebar.

**Stitch project ID:** `13778591027946680367`

---

## BRAND & CHROME (applies to every screen)

**Colors:**
- Background: cream `#F7F1ED`
- Primary: deep burgundy `#640015`
- Accent: muted rose `#AB655C`
- Text: dark gray `#4D4D4D`

**Fonts:** Noto Serif (headings) · Manrope (body)

**Top bar (full width, fixed):**
- Left: "Prosper with Em" in Noto Serif burgundy inside a subtle rounded pill with a small ▾ chevron — styled as a business switcher dropdown
- Right: small magnifying glass icon + circular "EM" avatar in cream on burgundy circle
- Cream background, subtle light rose bottom border

**Left sidebar (fixed, full height, deep burgundy `#640015`, 220px):**
- Nav items with icon + label in cream Manrope: Home · Clients · Meetings · Milestones · Projects · Tasks
- Active item: cream background pill with burgundy text
- Inactive: cream text, muted opacity
- Bottom: Settings gear icon only, cream, no label

---

## Screen 1 — Home ✅ LOCKED — DO NOT REGENERATE

The Home screen is finalized in Stitch. Reference it as the template for all other screens.

**What it contains (for reference):**
- Greeting: "Good morning, Emilia" + "Here's your day." + date line ("Tuesday, May 20")
- 5 stat cards row (each with different visualization):
  1. Active Clients — stage breakdown pills showing client counts by stage
  2. New Leads — large number + upward arrow + this week / this month counts
  3. Tasks — donut ring showing done vs open (e.g., "8 done · 12 open")
  4. Projects — colored status pills (Active · On Hold · Complete) with counts
  5. Milestones — step indicator (X of Y complete)
- Today's Meetings section with "+ Add Meeting" button — cards show: client name, time, duration, meeting type pill, client stage badge, agenda note, "View Client · Add Notes" links, "Join" button for Zoom
- Tasks Due Today section with "+ Add Task" button — checklist with association tags (project or client name), one completed item shown faded with strikethrough

---

## Screen 2 — Clients (Kanban)

**Status:** Prompt ready. Duplicate Home screen and paste as Edit.

Fill the main content area with the following. Do not change the top bar or sidebar.

**Page header row:**
"Clients" in Noto Serif h1 dark gray, left-aligned. Far right: a small "+ Add Client" button in deep burgundy `#640015`, white text, rounded corners 6px, same size and style as the "+ Add Meeting" button on the Home screen.

**Filter bar** directly below the header with 16px vertical padding:
- Left: search input — "Search clients..." placeholder, light border `#E8E0DC`, rounded corners, 12px Manrope, white background, 200px wide
- Right: three small filter pills — "All" (active: burgundy background, cream text), "Package" (inactive: light rose background, burgundy text), "Ongoing Support" (inactive: light rose background, burgundy text). All pills 11px Manrope, 8px horizontal padding, rounded corners.

**Kanban board:**
5 columns in a horizontal row, equal width, fitting within the full content area with 10px gaps between columns.

Column styling:
- Background: `#FAFAFA`, 1px border `#E8E0DC`, rounded corners 8px, 12px padding
- Column header: stage name in 13px Noto Serif dark gray on the left + small solid burgundy circle badge with cream number on the right
- Thin 2px burgundy `#640015` top border across the full column header

**Columns in order:** Lead · Discovery · Active · Paused · Cold

**Client card styling (apply to all cards):**
White background, 8px rounded corners, soft drop shadow, 12px padding, 8px gap between cards. All text stays within card bounds.

Each card contains:
- Line 1: Client name in 13px bold Manrope dark gray on left. Right: 10px solid circle attention dot — green `#4CAF50` (≤7 days since contact), amber `#F59E0B` (7–14 days), red `#DC2626` (14+ days) + 10px muted gray label: "Recent" / "Follow up" / "Overdue"
- Line 2 (Active clients only): small service type pill — light burgundy tint background `#F5E8EA`, deep burgundy text, 11px Manrope, rounded corners. Shows offer name.
- Line 3: "Last contact: May 18" in 11px muted gray
- Line 4: "Next: May 22 · Check-in" in 11px muted gray italic — omit if no meeting scheduled
- Line 5: "View Client · Log Interaction" in 11px muted rose text links, separated by ·

**Sample data:**

Lead (3 cards):
- Sarah M. — green dot — Last contact: May 19 — Next: May 23 · Discovery Call
- Amanda R. — amber dot — Last contact: May 13
- Lisa C. — green dot — Last contact: May 20 — Next: May 24 · Discovery Call

Discovery (2 cards):
- Jessica T. — green dot — Last contact: May 18 — Next: May 22 · Check-in
- Remi O. — amber dot — Last contact: May 11

Active (3 cards):
- Priya K. — Growth pill — green dot — Last contact: May 19 — Next: May 21 · Session
- Marcus J. — Supported pill — amber dot — Last contact: May 12
- Leila S. — Clarity pill — green dot — Last contact: May 18 — Next: May 23 · Session

Paused (1 card):
- Nina F. — red dot — Last contact: May 2

Cold (empty state):
No cards. Show a subtle centered placeholder: small dashed border rectangle with "No cold clients" in 12px italic muted gray.

---

## Screen 3 — Client Detail

**Status:** In progress — base generated, edit prompt below applied on top.

Fill the main content area with the following. Do not change the top bar or sidebar.

**Breadcrumb:** "← Back to Clients" in small 12px Manrope muted gray, top of content area.

**Client header block:**
- Client name "Priya K." in Noto Serif h1 dark gray
- Inline row below name: stage badge "Active" in deep burgundy filled pill (cream text) + service pill "Growth" in light burgundy tint `#F5E8EA` (deep burgundy text) — both 12px Manrope, rounded corners
- Small key details row in 12px Manrope muted gray with icons inline: ✉ priya.k@example.com · 📞 +1 (555) 012-3456 · 📅 Joined Jan 12, 2024 · 👤 Referred by Sarah J.
- Three action buttons right-aligned: "Log Interaction" · "Add Task" · "Schedule Meeting" — small outlined burgundy buttons, 12px Manrope, 6px rounded corners

**Tab row** below header (full-width bottom border `#E8E0DC`):
Four tabs: Overview · Activity · Meetings · Tasks
Active (Overview): 13px Manrope deep burgundy, 2px solid burgundy underline flush to bottom border. Inactive: muted gray.

**Overview tab — two equal columns:**

Left column — **Contact Information** section heading in 13px Noto Serif dark gray + thin burgundy left-border accent on the section heading.

Each field below styled as: 3px left border in muted rose `#AB655C`, 12px left padding, 8px vertical padding, no background.
- Label: 10px Manrope muted gray uppercase tracking-wide
- Value: 13px Manrope dark gray

Fields: Full Name · Email Address · Phone Number · Start Date · Referred By
Sample values: Priya Kapoor · priya.k@example.com · +1 (555) 012-3456 · January 12, 2024 · Sarah Jenkins

Right column — **Financial Details**: 5 stacked section cards. Each card: white background, 1px border `#E8E0DC`, 10px rounded corners, 14px padding, soft drop shadow, 12px gap between cards. Each card has a section label at top: 10px uppercase Manrope muted gray with a small icon left.

**Card 1 — 💰 Income & Assets**
2×2 grid of mini data blocks (12px gap). Each block: 10px uppercase Manrope muted gray label + 14px Noto Serif dark gray value.
Blocks: "Income Range" · "$85,000 – $110,000" / "Income Source" · "W2 Employee" / "Savings" · "$12,000" / "Investments" · "Roth IRA, 401k"

**Card 2 — 💳 Debt**
13px Manrope dark gray, line-height 1.6.
Sample: "Student loans ($18k) · No credit card debt · Car loan ($6k remaining)"

**Card 3 — 🛠 Finance Tools**
Horizontal wrap of tag pills: cream `#F7F1ED` background, 1px border `#AB655C`, 11px Manrope dark gray, 8px horizontal padding, 4px vertical padding, fully rounded.
Sample pills: "YNAB" · "Fidelity" · "Robinhood" · "Chase" · "Mint"

**Card 4 — 🎯 Goals**
Vertical list of 3 goal rows. Goal text 13px Manrope dark gray left · status badge right.
- "In Progress": muted rose tint background, burgundy text, 10px Manrope pill
- "Complete": burgundy `#640015` filled, cream text, same sizing — row faded with strikethrough
Sample: "Build $20k emergency fund" · In Progress / "Max out Roth IRA contributions" · In Progress / "Pay off student loans" · Complete

**Card 5 — ⚡ Challenges**
Cream `#F7F1ED` background (signals freeform). Same border and corners.
13px Manrope dark gray, line-height 1.6.
Sample: "Tends to overspend on dining and travel. Has avoided looking at investment accounts. Wants to automate more but unsure where to start."

**Activity tab (inactive — shown as placeholder):**
Chronological timeline. Each entry: date on left in 11px muted gray, vertical muted rose connecting line, type badge (Call / Note / Email / Session) in muted rose pill, 1–2 line summary in 13px Manrope. "+ Log Interaction" button top right.
Sample: 3 entries — "May 19 · Session · Reviewed budget framework and set savings targets." / "May 12 · Call · Check-in on emergency fund progress." / "May 1 · Note · Client mentioned interest in opening a Roth IRA."

**Meetings tab (inactive — shown as placeholder):**
List of 2 meeting rows. Each row: date + time bold left · meeting type pill in muted rose · duration · notes preview in gray. "+ Schedule Meeting" button top right.
Sample: "May 21 · 10:00 AM · Session · 60 min · Reviewing investment options" / "May 15 · 10:00 AM · Check-in · 30 min · Monthly progress review"

**Tasks tab (inactive — shown as placeholder):**
Checklist of 3 tasks (1 complete). Each row: burgundy checkbox · task title in Manrope · due date in small muted rose · project or milestone association pill if any. Completed task faded with strikethrough below a thin divider. "+ Add Task" top right.
Sample: "Send budget worksheet — Due May 22 · Priya K." / "Review Roth IRA options — Due May 25" / ~~"Send welcome packet — Completed May 12"~~

---

## Screen 4 — Meetings

**Status:** Not yet generated. Duplicate Home screen and paste as Edit.

Fill the main content area with the following. Do not change the top bar or sidebar.

**Page header row:**
"Meetings" in Noto Serif h1 dark gray, left-aligned. Far right: a "List · Calendar" toggle — two small pills side by side, List active (burgundy background, cream text), Calendar inactive (cream background, muted gray text), 11px Manrope, 8px horizontal padding, fully rounded. Next to toggle: "+ Schedule Meeting" button in deep burgundy `#640015`, cream text, 12px Manrope, 6px rounded corners.

**Google Calendar sync bar** directly below header:
Full-width slim bar, cream `#F7F1ED` background, 1px border `#E8E0DC`, 8px rounded corners, 10px padding. Small Google Calendar icon left · "Synced with Google Calendar · Last updated 2 min ago" in 11px Manrope muted gray. Right side: "Manage sync →" in 11px muted rose.

**Filter bar** below sync bar (16px vertical padding):
- Left: search input — "Search meetings..." placeholder, light border `#E8E0DC`, white background, 12px Manrope, 200px wide, rounded corners
- Right: filter pills — "All" (active: burgundy bg, cream text) · "This Week" · "Upcoming" · "Past" — inactive pills: cream bg, muted gray text, 1px border `#E8E0DC`. All pills 11px Manrope, 8px horizontal padding, fully rounded.

---

**Upcoming section:**
Section heading "Upcoming" in 13px Noto Serif dark gray with thin burgundy left-border accent. Count badge "4" — small solid burgundy circle, cream number, right of heading.

4 meeting cards stacked vertically, 10px gap. Each card: white background, 1px border `#E8E0DC`, 10px rounded corners, 14px padding, soft drop shadow.

Card layout:
- Left: client initials circle — 40px diameter, deep burgundy `#640015` background, 2-letter initials in 13px Noto Serif cream, centered
- Middle (flex column): client name in 13px bold Manrope dark gray · below: meeting type pill in muted rose `#AB655C` tint background, burgundy text, 10px Manrope + duration in 11px muted gray (e.g., "60 min") · below: agenda note in 12px Manrope muted gray italic (1 line)
- Right: date + time in 12px Manrope dark gray bold top-right · small Google Calendar icon below date · "Join" button in small outlined burgundy if Zoom link exists

Sample upcoming cards:
1. PK — Priya K. · Session · 60 min · "Review investment account setup and Roth IRA contributions" · May 22 · 10:00 AM · Google Calendar icon · Join button
2. JT — Jessica T. · Discovery Call · 45 min · "First call — budget overview and goal setting" · May 23 · 2:00 PM · Google Calendar icon · Join button
3. SM — Sarah M. · Check-in · 30 min · "Follow up on emergency fund progress" · May 24 · 11:00 AM · Google Calendar icon
4. LS — Leila S. · Session · 60 min · "Debt payoff strategy review" · May 25 · 9:00 AM · Google Calendar icon · Join button

---

**Past Meetings section:**
Thin full-width divider `#E8E0DC` between sections. Section heading "Past Meetings" in 13px Noto Serif muted gray (slightly faded vs Upcoming heading). Same left-border accent, muted.

4 meeting cards, same structure as Upcoming but with reduced opacity (85%) to signal past. No "Join" button. Each card has a "View Notes →" text link in muted rose `#AB655C` on the far right instead.

Sample past cards:
1. PK — Priya K. · Session · 60 min · "Reviewed budget framework, set emergency fund target" · May 15 · 10:00 AM · View Notes →
2. RO — Remi O. · Discovery Call · 45 min · "Intro call, discussed debt situation and goals" · May 14 · 3:00 PM · View Notes →
3. LS — Leila S. · Session · 60 min · "Introduced debt avalanche strategy" · May 11 · 9:00 AM · View Notes →
4. JT — Jessica T. · Check-in · 30 min · "Checked in on savings automation setup" · May 8 · 1:00 PM · View Notes →

---

## Screen 5 — Milestones

**Status:** Regenerate from blank screen using updated unified prompt below.

Add a main content area to the right of the sidebar that fills all remaining screen width. Inside it:

**Page header row:** "Milestones" in Noto Serif h1 dark gray. Subtitle below: "Your big-picture business goals." in 13px Manrope muted gray. Far right: "+ Add Milestone" button in deep burgundy `#640015`, cream text, 12px Manrope, 6px rounded corners.

**Filter bar** (16px below header): Search input left — "Search milestones..." placeholder, `#E8E0DC` border, white bg, 12px Manrope, 200px wide, rounded. Filter pills right — "All" (active: burgundy bg, cream text) · "In Progress" · "Upcoming" · "Complete" — inactive: cream bg, muted gray text, 1px border `#E8E0DC`. 11px Manrope, 8px horizontal padding, fully rounded.

**5 milestone cards**, 12px gap. Each card: white bg, 1px border `#E8E0DC` on all sides, 10px rounded corners, 16px padding, soft drop shadow. No colored left border accent.

Card structure:
- Top row: title in 15px Noto Serif dark gray left · status badge right ("In Progress": rose tint bg `#F5DCE0`, burgundy text · "Complete": burgundy bg, cream text · "Upcoming": gray bg `#F0EEEC`, dark gray text)
- Row 2: 📅 target or completion date in 11px Manrope muted gray
- Description: 12px Manrope muted gray, 1–2 lines
- Progress bar (In Progress only): full width, 6px, rounded, cream `#F7F1ED` track, burgundy fill, % label 10px muted gray right-aligned above bar
- Footer (thin top border `#E8E0DC`, 10px padding): "📁 X Projects" pill + "✓ X Tasks" pill left — cream `#F7F1ED` bg, 1px rose `#AB655C` border, 11px Manrope · "View all →" muted rose right

Cards:
1. "Launch Prosper Website" — Complete — "Completed Apr 2026" — "Built and deployed the Prosper with Em coaching website." — no progress bar — 📁 1 Project · ✓ 6 Tasks — card 85% opacity, ✓ icon left of title
2. "Onboard First 5 Paying Clients" — Complete — "Completed May 2026" — "Signed first 5 clients across Clarity and Confidence packages." — 📁 0 Projects · ✓ 3 Tasks — same faded treatment
3. "Hit $3k MRR" — In Progress — "Target: Aug 2026" — "Reach $3,000 in monthly recurring revenue." — progress bar 60% — 📁 2 Projects · ✓ 4 Tasks
4. "Build Group Coaching Program" — In Progress — "Target: Oct 2026" — "Design and launch a scalable group program for 8–12 women." — progress bar 20% — 📁 1 Project · ✓ 3 Tasks
5. "Hit $5k MRR" — Upcoming — "Target: Dec 2026" — "Scale to $5,000 monthly recurring revenue." — no progress bar — 📁 0 Projects · ✓ 0 Tasks

Once the layout is placed, do not adjust, reposition, or realign any elements. Lock all positions as-is.

---

## Screen 6 — Projects

**Status:** Regenerate from blank screen using updated unified prompt below.

Add a main content area to the right of the sidebar that fills all remaining screen width. Inside it:

**Page header row:** "Projects" in Noto Serif h1 dark gray. Far right: "+ New Project" button in deep burgundy `#640015`, cream text, 12px Manrope, 6px rounded corners.

**Filter bar** (16px below header): Search input left — "Search projects...", same styling as Milestones. Filter pills right — "All" (active) · "Active" · "On Hold" · "Complete". Same pill styling.

**5 project cards**, 12px gap. Same card base as Milestones. Left border 3px — has client association: burgundy `#640015` · milestone only: muted rose `#AB655C` · no associations: light gray `#E8E0DC`.

Card structure:
- Top row: title in 15px Noto Serif dark gray left · status badge right ("Active": rose tint bg `#F5DCE0`, burgundy text · "On Hold": gray bg `#F0EEEC`, dark gray text · "Complete": burgundy bg, cream text)
- Row 2: 📅 due date in 11px Manrope muted gray
- Description: 12px Manrope muted gray, 1 line
- Progress bar (all cards): full width, 6px, rounded, cream `#F7F1ED` track, burgundy fill, % label 10px muted gray right-aligned above bar
- Association pills (skip row if none): 🎯 milestone pill — `#F0EEEC` bg, `#6B6360` text, `#D4CFCC` border · 👤 client pill — `#F9EDE8` bg, `#8B4A4A` text, `#D4A090` border. 11px Manrope, 8px horizontal padding, 4px vertical, fully rounded.
- Footer (thin top border `#E8E0DC`, 10px padding): "X tasks · Y open" in 11px muted gray left · "View all →" muted rose right

Cards:
1. "Website Refresh" — Active — Due Jun 15 — "Redesign and update the Prosper with Em website." — progress bar 50% — 🎯 Hit $3k MRR — 4 tasks · 2 open — rose left border
2. "Client Onboarding Flow" — Active — Due May 30 — "Build a repeatable onboarding process for new clients." — progress bar 67% — 🎯 Hit $3k MRR · 👤 Priya K. — 3 tasks · 1 open — burgundy left border
3. "June Content Plan" — Active — Due Jun 1 — "Plan and schedule June social and email content." — progress bar 33% — no associations — 6 tasks · 4 open — gray left border
4. "Discovery Call Script" — Complete — "Due was May 10" — "Write and refine the discovery call framework." — progress bar 100% — no associations — 2 tasks · 0 open — card 85% opacity, ✓ icon left of title — gray left border
5. "Group Program Outline" — On Hold — Due Oct 2026 — "Draft curriculum for group coaching program." — progress bar 0% — 🎯 Build Group Coaching Program — 5 tasks · 5 open — rose left border

Once the layout is placed, do not adjust, reposition, or realign any elements. Lock all positions as-is.

---

## Screen 7 — Tasks

**Status:** Regenerate from blank screen using updated unified prompt below.

Add a main content area to the right of the sidebar that fills all remaining screen width. Inside it:

**Page header row:** "Tasks" in Noto Serif h1 dark gray. Far right: "+ Add Task" button in deep burgundy `#640015`, cream text, 12px Manrope, 6px rounded corners.

**Filter bar** (16px below header): Search input left — "Search tasks...", same styling. Filter pills right — "All" (active) · "Open" · "Complete". "Filter by Project ▾" small dropdown pill far right, same inactive style.

**Open section:**
Section heading "Open" in 13px Noto Serif dark gray, thin burgundy left-border accent. Count badge "6" — small solid burgundy circle, cream number.

6 task cards, 8px gap. Each card: white bg, 1px border `#E8E0DC` on all sides, 10px rounded corners, **16px padding**, soft drop shadow. No colored left border accent.

Card layout:
- Left: 20px square checkbox — unchecked, 2px burgundy border, rounded corners
- Middle: task title in 13px Manrope dark gray · below: association pills row, color-coded by type — 📁 project pill: `#F5E8EA` bg, `#640015` text, `#C9A0A8` border · 👤 client pill: `#F9EDE8` bg, `#8B4A4A` text, `#D4A090` border · 🎯 milestone pill: `#F0EEEC` bg, `#6B6360` text, `#D4CFCC` border. All 11px Manrope, 8px horizontal padding, 4px vertical, **4px border radius (rectangular, not fully rounded)**. Skip row if no associations.
- Right: due date in 11px muted rose · ⋯ three-dot menu muted gray far right

Open task cards:
1. "Review budget template draft" — Due May 21 — 📁 Client Onboarding Flow · 👤 Priya K.
2. "Write discovery call script" — Due May 22 — 📁 Discovery Call Script
3. "Schedule June content posts" — Due May 25 — 📁 June Content Plan
4. "Update website hero copy" — Due May 23 — 📁 Website Refresh · 🎯 Hit $3k MRR
5. "Prep session notes for Marcus" — Due May 21 — 👤 Marcus J.
6. "Research group program pricing" — Due May 28 — 🎯 Build Group Coaching Program

**Completed section:**
Thin full-width divider `#E8E0DC`. Section heading "Completed" in 13px Noto Serif muted gray, same left-border accent but muted. Count badge "3" same style.

3 task cards, same structure, 85% opacity. Checkbox filled solid burgundy with cream ✓. Title strikethrough, muted gray. No due date.

1. "Set up Calendly integration" — 📁 Website Refresh
2. "Send welcome email to Leila" — 👤 Leila S.
3. "Draft onboarding checklist" — 📁 Client Onboarding Flow

Once the layout is placed, do not adjust, reposition, or realign any elements. Lock all positions as-is.
