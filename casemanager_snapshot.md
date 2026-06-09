# CaseManager — PRD Snapshot & Context Handoff

**Status:** Build in progress  
**Date:** 2026-06-09  
**Author:** [Your name]  
**Version:** 0.6 — S-R5 shipped

---

## How to use this document

This is a handoff snapshot from the PRD scoping session. Every decision below has been discussed and locked. When continuing in a new context window, treat this as ground truth. Do not re-open closed decisions unless explicitly flagged as open.

---

## 1. Problem Statement (locked)

A cost-center department's budget is not being spent effectively due to a high friction manual process to request exceptions to resource commitments that discourages staff from trying to comply with policy. That process is entirely run through an email channel, relies upon individual interpretation of policy, and has no auditability. As a result leadership has no view into this process either to support the managing department or address problematic teams.

---

## 2. Product Goals (locked)

1. Automatic routing eliminates manual chasing at every stage of the process.
2. Audit log eliminates excuses — every delay has a named responsible party that can be identified.
3. 90% of cases close in under one day. (External dependency: approver responsiveness. Product owns the tooling, not the behavior.)
4. Uptime and ease of use high enough to support chargeback enforcement — no room to push back on process grounds.
5. Dept admins spend at most 10 minutes per day managing cases in the tool.
6. Requestors can submit a case in under 5 minutes (validated via usability testing, not system measurement).
7. Approvers can make a fully informed decision in under 5 minutes from a single screen with no need to reference external context.

---

## 3. Personas (locked)

### Requestor (MVP)
- **Need:** Frictionless submission, real-time status visibility
- **Motivation:** Will not engage unless effort is minimal. Historically no consequence for non-compliance. Needs CYA visibility — it can't be their fault if someone gets mad.
- **Failure mode:** High friction = non-compliance. Status opacity = disputes.

### Approver (MVP)
- **Need:** Information efficiency. Single-screen decision with full context.
- **Motivation:** Overworked. Will blanket-approve unless friction is low and context is clear. Needs to see who they're accountable to.
- **Failure mode:** Information overload = rubber stamping. Slow notification = delayed chain.

### Dept Admin / dAdmin (MVP)
- **Need:** Process clarity and centralized case visibility by module.
- **Motivation:** This is the most painful part of their job. Wants to be a gatekeeper, not an errand runner.
- **Failure mode:** Too many screens or manual steps = back to email.

### Firm Leadership (future)
- **Need:** Information quality, exception surfacing, confidence in data integrity.
- **Motivation:** Cost center oversight. Needs zero-learning-curve. Problems should surface to them, not require hunting.
- **Failure mode:** Opaque data = can't act on problem teams.

### Sysadmin / sAdmin (future, partial MVP for policy matrix config)
- **Need:** System configuration, coverage management, routing rule ownership.
- **Motivation:** Nerve center. Must be able to assign dAdmins to modules, manage coverage gaps, and push policy matrix updates (with dept leadership confirmation).
- **Failure mode:** Config errors break routing for every downstream user.
- **Note:** 2-3 sAdmins planned for coverage redundancy.

---

## 4. User Stories & Acceptance Criteria (locked)

### Requestor Stories

**S-R1:** As a requestor, I want to see only the modules I am assigned to so that I can quickly identify what to submit a case for without searching through irrelevant options.  
**A-R1:** Given authentication of user, when a user begins a case submission, then they can only see modules relevant to them, constraining their options.

**S-R2:** As a requestor, I want to select a case type and submit a short reason so that I can complete a submission quickly without being slowed down by unnecessary fields.  
**A-R2:** Given a module selection, when a user defines their case, then they will only see a limited dropdown of case types with a mandatory but limited free response explanation (75 character minimum).

**S-R3:** As a requestor, I want the system to automatically route my case to the correct approvers based on policy so that I don't have to interpret rules or determine who needs to sign off.  
**A-R3:** Given a case type selection and user authentication, when the user submits the case, then they are shown the correct sequence of approvers and the request is sent to the first in the chain.

**S-R4:** As a requestor, I want to see the current step, responsible party, and full history of my case at any time so that I can identify who is creating delays and demonstrate I am not the blocker.  
**A-R4:** Given a submitted case, when the user revisits the tool, then the user can view a status dashboard showing in real time who has the request and how many steps remain. Approver names are visible (not role only).

**S-R5:** As a requestor, I want to submit a case in under 5 minutes so that I can stay compliant without it competing with my primary work.  
**A-R5:** Given a compliant user, when a user endeavors to submit a case, then a usability test with real users confirms the full submission flow can be completed in under 5 minutes.

**S-R6:** As a requestor, I want to receive a notification with the final decision and reasoning when my case closes so that I understand the outcome and have a record if the decision is disputed.  
**A-R6:** Given a decision on a case, when a user receives a notification, then they will see a log of who decided on the case and what their reasoning was. Notification channel: email for demo, Teams/Slack for production.

---

### Approver Stories

**S-A1:** As an approver, I want to receive a notification that links me directly to the case so that I can quickly navigate to it in the flow of work.  
**A-A1:** Given a notification is sent, when the approver views it, then there is a direct link to the case view within it.

**S-A2:** As an approver, I want to see the full case context including requestor details and prior decision history so that I can make a fully informed decision without referencing anything else.  
**A-A2:** Given a portal link is opened, when the approver hits the case view page, then they see the requestor, case details, case type, and a decision log of previous approvers with their roles and reasoning.

**S-A3:** As an approver, I want to be able to quickly decide while giving my reasoning so that I don't burn too much of my own time and support proper resource allocation.  
**A-A3:** Given a portal link is opened, when the approver hits the case view page, then there is an approve/deny action and a mandatory reason field requiring a minimum of 100 characters before submission is enabled.

**S-A4:** As an approver, I want the process to continue automatically after I provide my input so that I don't need to be concerned about next steps.  
**A-A4:** Given a response submitted by an approver, when the response is evaluated, then it will either auto-route to the next sequential approver or terminate early and return to the requestor in the case of a denial — with full decision log attached.

---

### Dept Admin Stories

**S-D1:** As a dAdmin, I want to view all modules I am responsible for upon authentication so that I can focus on only the things that require my specific attention.  
**A-D1:** Given a user authenticates and has the dAdmin role, when the user opens the module admin view, then they see only the modules they are responsible for and cases tied to those modules.

**S-D2:** As a dAdmin, I want to quickly monitor cases for my module so I can see if certain modules are becoming hotspots.  
**A-D2:** Given a dAdmin signs into their modules dashboard, when they see their assigned modules, then they can see active cases for each, who is requesting, and what process step they are on.

**S-D3:** As a dAdmin, I want to be notified as the final approver in all cases that have secured all other approvals so that I can act as gatekeeper and ensure policy is enforced correctly.  
**A-D3:** Given a case that has secured all other approvals, when the logic engine evaluates, then it sends to the named dAdmin that manages said module for final signoff with the full audit chain visible.  
**Note:** dAdmin is always the final approver unless early termination (denial) occurs earlier in the chain.

**S-D4:** As a dAdmin, I want to confirm that I have committed approved allocation changes so that there is a record that the change was actually processed.  
**A-D4:** Given a request has received dAdmin final signoff, when the dAdmin completes their signoff, then they are provided a structured dropdown affirmation step (options: policy satisfied / expedited / special case). On approval, a completion timestamp is added to the audit log. On denial, a minimum 200 character written reason is required before submission is enabled. Signoff triggers case closure, requestor notification, and an audit log entry.

---

## 5. Policy Matrix (locked)

Early flag logic: if module type is B and delivery date is more than 4 weeks from submission date, early flag = yes. This is system-calculated from the module's delivery date field — not self-declared by requestor (exploit prevention).

| Staff Type | Module Type | Case Type | Early Flag | Approver Chain | Final |
|---|---|---|---|---|---|
| Consultant | A | Business | n/a | PM → Principal → Partner → Practice Head | dAdmin |
| Consultant | A | Personal | n/a | PM → Talent Manager | dAdmin |
| Support | A | Business | n/a | Line Manager → Dept Leader → Regional COO | dAdmin |
| Support | A | Personal | n/a | Line Manager → Talent Manager | dAdmin |
| Consultant | B | Business | No | PM → Principal → Partner → Practice Head | dAdmin |
| Consultant | B | Personal | No | PM → Talent Manager | dAdmin |
| Support | B | Business | No | Line Manager → Dept Leader → Regional COO | dAdmin |
| Support | B | Personal | No | Line Manager → Talent Manager | dAdmin |
| Consultant | B | Business | Yes | (bypass all) | dAdmin only |
| Consultant | B | Personal | Yes | (bypass all) | dAdmin only |
| Support | B | Business | Yes | (bypass all) | dAdmin only |
| Support | B | Personal | Yes | (bypass all) | dAdmin only |

**Effective rule set (5 rules + early flag bypass):**
1. Consultant + Business (A or B, no early flag): PM → Principal → Partner → Practice Head → dAdmin
2. Consultant + Personal (A or B, no early flag): PM → Talent Manager → dAdmin
3. Support + Business (A or B, no early flag): Line Manager → Dept Leader → Regional COO → dAdmin
4. Support + Personal (A or B, no early flag): Line Manager → Talent Manager → dAdmin
5. Any + Module B + Early flag: dAdmin only (all intermediaries bypassed)

**Specialists:** Omitted from demo. Function like Support in 95% of cases. Noted for production documentation.

**Consultant seniority routing:** Omitted from demo. Adds build complexity without sufficient APM portfolio value.

---

## 6. Scope (locked)

### In scope (MVP demo)
- Requestor submission flow
- Approver decision flow (single-screen, full context)
- dAdmin case management view and final signoff
- End-to-end case completion: full approval path and early termination (denial) path
- Policy engine (preloaded, not configurable via UI)
- Audit log on every case
- In-app notification inbox (mock email — shows what would have been sent)
- Seed data supporting 4 testable policy flows + 1 mid-chain rejection
- Simple eID login (select from user list, no SSO)

### Out of scope (future / voice-over only)
- Sysadmin configuration UI
- Leadership dashboard and reporting
- Real integrations (Tableau, Teams, Slack, email)
- Policy matrix configuration screen
- Real employee directory hook
- Chargeback enforcement tooling

---

## 7. Open Questions & Decisions (all locked)

| # | Question | Decision |
|---|---|---|
| 1 | Notification channel | Email for demo. Teams/Slack for production. In-app mock inbox preferred over live email in demo. |
| 2 | Case types | Binary: Business or Personal. Fixed, not configurable in demo. |
| 3 | Module assignment | Controlled by sAdmin. Preloaded for demo. |
| 4 | dAdmin always final approver? | Yes, unless early termination (denial) occurs — that is the only exception. |
| 5 | sAdmin policy matrix updates | Requires dept leadership confirmation before pushing. Out of scope for demo. |
| 6 | Stall notification threshold | 72 hours. Notifies both requestor and dAdmin. Configurable in future. |
| 7 | Approver minimum reason length | 100 characters. Applies to all approvers. |
| 8 | dAdmin signoff format | Structured dropdown for approvals (policy satisfied / expedited / special case). Denial requires 200 character minimum written reason. |
| 9 | Requestor reason minimum | 75 characters. |
| 10 | Denial behavior | Any denial at any stage terminates the chain immediately. Case returns to requestor with full decision log. dAdmin is skipped only in this scenario. |
| 11 | Database sync cadence | Weekly (external system). In-flight cases lock to submission-time delivery dates. New submissions use updated delivery dates. Documented as external dependency in demo. |
| 12 | Coverage gap behavior | If approver is on leave or terminated, system skips them in chain but flags to dAdmin. Stall notification (72hr) triggers collaborative resolution between requestor and dAdmin. Requestor cannot flag coverage gaps at submission (exploit prevention). |
| 13 | Approver name visibility | Full name visible to requestor on status view. Not role only. |
| 14 | Concurrent submissions | Allowed. A requestor may have multiple active cases across modules simultaneously. |
| 15 | In-flight delivery date changes | Cases in flight lock to submission-time dates. Date changes only affect future submissions. |
| 16 | Rubber-stamping risk | Social pressure mechanism: all approver reasoning is visible to subsequent approvers and dAdmin. 100 char minimum enforces minimum thought. dAdmin acts as final quality gate. |

---

## 8. Success Metrics (locked)

| Goal | Metric | Measurement method |
|---|---|---|
| Automatic routing | Policy engine returns correct approver chain in 100% of valid submissions. Zero manual routing interventions. | QA test all 5 rules + early flag in demo. |
| Audit log completeness | Every case action (submission, each approval/denial, dAdmin signoff, closure) has a timestamp and named actor. | Manual audit of test cases in demo. |
| 90% same-day close | 90% of cases move from submission to dAdmin final signoff in under 24 hours. | Production data only. External dependency: approver responsiveness. Not measurable in demo. |
| Chargeback readiness | Tool sustains multi-user load during peak periods (e.g. summer). 3-6 months clean operation before enforcement applied. High leadership satisfaction. No significant operational disruptions. | Production rollout KPI. |
| Admin efficiency | dAdmins self-report under 10 minutes per day in tool. Individual case action time is low. High volume periods logged separately to avoid skewing aggregate. | Time-on-task diary study with dAdmins in production. |
| Requestor submission time | Full submission flow completed in under 5 minutes on average. | Moderated usability test with representative users. |
| Approver decision time | Full case review and decision completed in under 5 minutes from single screen. | Moderated usability test with representative approvers. |

---

## 9. Technical Assumptions (locked)

- Employee identity keyed to eID. At login, eID resolves staff type, role, and module assignments.
- A user can hold multiple roles (e.g. requestor + approver). Never for the same case. Landing page surfaces available actions based on active roles.
- Policy matrix preloaded as seed data. Not configurable via UI in demo.
- Module delivery dates are a field on the module record. Used by policy engine to calculate early flag at submission time.
- Notification delivery mocked as in-app inbox in demo. Production target: Microsoft Teams.
- No real SSO. Demo uses eID selector (dropdown or login screen) tied to seeded user table.
- Employee directory mocked via seed data. Production would hook into Tableau or equivalent HR database via eID as primary key.

---

## 10. Demo Seed Data Plan

### Testable flows (4 flows + 1 rejection)
1. Consultant + Module A + Business case → full chain (PM → Principal → Partner → Practice Head → dAdmin)
2. Support + Module A + Business case → full chain (Line Manager → Dept Leader → Regional COO → dAdmin)
3. Support + Module A + Personal case → short chain (Line Manager → Talent Manager → dAdmin)
4. Any + Module B + Early flag → dAdmin only (bypass all)
5. Mid-chain rejection → approver denies partway through chain → case returns to requestor with decision log

### Remaining rules (documented only, not demo-tested)
- Consultant + Personal
- Consultant + Module B (no early flag)
- Support + Module B (no early flag)

### Seed data needs
- ~8-10 user identities across staff types and approver roles
- 3-4 modules (mix of type A and B, artificial delivery dates)
- At least one Module B with delivery date >4 weeks out (triggers early flag)
- dAdmin assigned to each module
- README with login instructions and suggested test flows

---

## 11. Build Stack (TBD — to decide at build kickoff)

Stack not yet decided. Decision criteria: what the product needs, not familiarity. Evaluate based on:
- Auth simplicity (eID selector, no SSO)
- Routing logic complexity (policy engine needs to be clean and testable)
- Notification mockup capability
- Recruiter accessibility (runs in browser, no setup required)
- PM portfolio context (common enough that hiring panels recognize it)

## 12. Deferred / Parking Lot & Locked Side Decisions

Tracks (a) decisions intentionally postponed and (b) decisions made outside the core PRD scope that should persist across context windows. Each entry: date, item, decision/reason, trigger to revisit (if deferred).

### Deferred

| Date | Item | Reason deferred | Revisit when |
|---|---|---|---|
| 2026-05 | Portfolio framing layer on PRD (problem → approach → outcome wrapper, recruiter-skim version above the fold, "what I'd do differently" retrospective) | Requires net-new writing that depends on the demo existing. Build clean PRD doc first, layer framing once demo is shippable. Originally option (3) from the HTML PRD scoping conversation. | Demo is functional end-to-end and ready to link from the PRD. |
| 2026-05 | Mobile-responsive policy matrix table (Section 5) | Table scrolls horizontally on small screens. Acceptable for v1 but not ideal if recruiters open on phone. Options: collapse to cards on mobile, or accept. | Demo build is complete and there's bandwidth for PRD polish, OR a recruiter explicitly flags mobile readability. |

### Locked side decisions

| Date | Item | Decision | Rationale |
|---|---|---|---|
| 2026-05 | Product name | **Flume** | Short, distinctive silhouette for typographic display. Fits the product mechanic literally (cases flowing through constrained approval channels). Personal resonance — ChemE background. Prior art exists (Apache Flume, UK musician) but not blocking for a portfolio piece. Considered: Manifold (rejected — more generic in tech context, longer name limits display options, conflict with Manifold Markets). |
| 2026-05 | Visual design direction | **Kollokium discipline × neobrutalist display × restrained CRT/PS2 accents.** Aggression dial: 6/10 for v1, room to push louder in later versions. | References: Marathon (2026), Kollokium, Ming watches, PS2-era futurism. The skeleton is disciplined Swiss-grid; the accents are weird. Discipline prevents student-project feel; weirdness prevents Linear/Stripe clone feel. |
| 2026-05 | Color palette | Deep purple base (#14091F → #251638). Phosphor cyan primary signal (#7FE3D4). Sodium orange warm accent (#FFB347) for status/warnings. Rare magenta (#D946EF) reserved for emphasis. | Avoided cyan-on-dark and Twitch purple cliché. Deep purple + phosphor + sodium reads as retrofuture/CRT without going full Tron. Warm accent prevents all-cool-tones flatness. |
| 2026-05 | Type stack | Departure Mono (display, numbers, labels). Geist (body). JetBrains Mono (metadata, inline code). All free, all self-hostable. | Departure Mono is the CRT/retrofuture feel without cosplay. Geist chosen over Inter (Inter flagged as generic by frontend-design skill). Mono-for-display + sans-for-body contrast is the editorial pairing used by serious dev tools, pushed harder on the display side. |
| 2026-05 | Build stack | Still TBD. Locked decision: recommend based on what the product needs, not familiarity. No preference for Anthropic products. | Decision criteria documented in Section 11. Resume at: stack decision → build kickoff. |
---

13. Build Infrastructure Decisions (locked)
DateItemDecisionRationale2026-05HostingReplitVelocity over credibility optics. Portfolio proof of concept, not production. Friends in network use it. Shell access confirmed, Node v20 available.2026-05Local dev / coding assistantClaude Code in Replit shellReplit shell confirmed working. No local VS Code setup required.2026-05Frontend frameworkReact via ViteIndustry standard, hiring panel recognition, clean for browser-only app. Next.js rejected — complexity without demo value.2026-05Logic layerBrowser-side onlyNo backend. Policy engine runs in JS in the client. Keeps architecture simple for demo.2026-05Seed data formatJSON fileRelational structure between users, modules, roles, delivery dates. Swap to real DB in production.2026-05Portfolio structureSingle URL, demo embedded in portfolio siteOne codebase, one deployment. Recruiter gets seamless end-to-end experience.2026-05PRDLiving document through buildLock only when demo ships.2026-05Visual design iterationBuild structure first, wife reviews final visual elementsDesign system already locked — colors, type, spacing.

14. Notion Build Tracker (locked structure)
Board: Flume — Build Tracker
Columns: Backlog → In Progress → Code Review → Testing → Shipped
Card properties: Size (XS/S/M/L), Phase, Story ID, Blocked (checkbox), Notes
Visible on card face: Size, Phase, Blocked
Backlog blocks and card count:

Foundation: SETUP-01 through SETUP-05 (5 cards)
Policy Engine: PE-01, PE-02 (2 cards)
Requestor Flow: S-R1 through S-R6 (6 cards)
Approver Flow: S-A1 through S-A4 (4 cards)
dAdmin Flow: S-D1 through S-D4 (4 cards)
Audit Log: AL-01, AL-02 (2 cards)
Notification Inbox: NI-01 (1 card)
Portfolio Site: PS-01 through PS-05 (5 cards)
Checkpoints: CP-01 through CP-03 (3 cards)

Total: 32 cards
Checkpoint protocol:

CP-01: Screenshot before first card moves to In Progress
CP-02: Screenshot at roughly half cards Shipped (~end of week one)
CP-03: Screenshot at full demo Shipped, pair with written retrospective

Critical path: Foundation → Policy Engine → Requestor Flow → Approver Flow → dAdmin Flow → Audit Log → Notification Inbox → Portfolio Site
Sizing calibration:

XS: pure UI, no logic
S: simple logic or single data read
M: multiple moving parts, conditional logic, touches more than one layer
L: core system behavior (policy engine, approval chain)


15. Open Build Decisions (to resolve at kickoff)
ItemStatusSETUP-02 seed data size — S or MFlagged, revisit when buildingStack decision within Replit — framework TBDResolve at build kickoff
Stack decisionLocked — React via Vite, Replit, browser-only

## SETUP-01 — Dev Environment & Project Scaffold
**Status:** Shipped  
**Date:** 2026-05

### What was done
- Installed Node.js v24.15.0 and npm v11.12.1 on local machine
- Configured PowerShell execution policy (RemoteSigned) to allow npm
- Created GitHub account and initialized `flume` repo (private)
- Configured Git credentials and Git Credential Manager locally
- Created Replit project, scaffolded React + Vite via `npm create vite@latest`
- Configured `vite.config.js` with `allowedHosts: true` to allow Replit's generated domain
- Initialized Git in Replit shell, connected to GitHub remote via PAT authentication
- Resolved divergent branch conflict from README mismatch between Replit and GitHub
- Confirmed app runs at Replit external URL
- Confirmed all 17 files pushed to GitHub successfully

### Key decisions
- Replit over local/Vercel: lower friction, public URL for non-technical recruiters, no server config
- React + Vite: industry standard, hiring panel recognition, clean for browser-only app
- Browser-side only: no backend, policy engine will run in JS client-side
- PAT embedded in remote URL for authentication (Replit doesn't support credential manager)

### Notes
- Replit internal preview pane does not work with Vite dev server — use external URL
- CP-01 screenshot skipped (URL visible in shell output) — retake with URL cropped when bandwidth allows
- `git push` requires PAT embedded in origin URL: `https://USERNAME:TOKEN@github.com/...`

### Security Setup (append to SETUP-01)
**Date:** 2026-05

#### SSH — Local Machine → GitHub
- Generated Ed25519 SSH key pair on local machine via `ssh-keygen -t ed25519`
- Added public key to GitHub under Settings → SSH and GPG keys
- Verified authentication via `ssh -T git@github.com`
- Switched local flume repo remote URL from HTTPS to SSH (`git@github.com:CGJones99/flume.git`)
- Private key stays on local machine, never transmitted

#### PAT Secret — Replit → GitHub
- Generated PAT with `repo` scope only, 90 day expiration
- Stored PAT as encrypted Replit Secret under key `GITHUB_TOKEN`
- Replit remote URL uses `$GITHUB_TOKEN` environment variable — token never hardcoded
- Verified token expands correctly in shell and push succeeds
- Revoked and regenerated PAT to invalidate any previously exposed values
```markdown

## SETUP-02 — Seed Data Generation
**Status:** Shipped  
**Date:** 2026-06

### Schemas (all locked)

**Employee**
`employee_id, name, staff_type, role, org_unit, region, hire_date, project_code, line_manager_id, talent_manager_id`

**Module**
`module_id, module_name, module_type, delivery_date, allowed_staff_type, dadmin_id, cancellation_unit_value`

**Project**
`project_id, project_name, practice`

**Case**
`case_id, initial_timestamp, requestor_id, module_id, case_type, rule_number, early_flag, requestor_reason, most_recent_action, most_recent_timestamp, current_status, project_code`

**Event**
`event_id, case_id, actor_id, event_type, sequence_number, timestamp, reason`

### What was done
- Designed five schemas: Employee, Module, Project, Case, Event
- Defined org structure: 3 practices (Banking, Transportation, Restructuring), 3 support depts (Marketing, Human Capital, Design), Admin, Region Ops
- 20 employees per practice and support dept, 20 in Admin, 1 Regional COO — 141 total
- Wrote generateSeed.mjs — builds and wires all employee relationships, outputs employees.json, modules.json, projects.json to src/data/
- Confirmed output: 141 employees, 4 modules, 3 projects
- Spot checked reporting relationships, project codes, TM assignments
- Manually adjusted MOD-003 delivery date to 2026-08-15 for clear early flag margin

### Key decisions
- Case and Event schemas designed but not generated — no cases exist until the app creates them
- Flat approver columns rejected in favor of separate Event table for audit log
- cancellation_unit_value on module record, count derived at query time — no cancellation field on case
- TM assignment only wired to Consultant level for demo — PM and above have null TM. Parked for production
- Senior consultant role routing and partner opt-out rules out of scope for demo — parked for production
- org_unit unifies practice and dept into one field, keyed by staff type at runtime

### Notes
- SSH authentication set up in Replit shell, PAT revoked and shell history wiped
- Right-click for copy/paste in Replit shell — Ctrl+C kills process
- CP-01 screenshot still outstanding

## Session Update — 2026-06-03

### Build State
- SETUP-01: Shipped
- SETUP-02: Shipped
- Next: SETUP-03 → SETUP-04 → SETUP-05 → PE-01 → PE-02

### Decisions made this session
- Sequencing locked: Foundation cards first, then PE, then flows. Rationale: persona selector needed to test PE in context.
- PE-02 kept as single card but acceptance criteria split into two testable functions: (1) rule selection correct for all 5 rules, (2) chain resolution returns correct named people.
- Notion connected via MCP — board readable and writable from Claude directly. No need to paste card content into chat.

### Infrastructure
- SSH authentication set up in Replit shell. PAT revoked, shell history wiped. Git remote now uses SSH URL with no token in plain text.
- generateSeed.mjs deployed and run successfully — 141 employees, 4 modules, 3 projects written to src/data/
- MOD-003 delivery date manually adjusted to 2026-08-15 for clear early flag margin.

### Open items before SETUP-03
- Clear blocked flags on SETUP-03, PE-01, PE-02 in Notion — dependency was SETUP-02 which is now shipped
- CP-01 screenshot still outstanding — retake with URL cropped

### Parked
- TM assignment for PM and above — null in seed data, noted for production
- Senior consultant routing and partner opt-out rules — out of demo scope

```

## SETUP-03 — eID login / persona selector
**Status:** Shipped  
**Date:** 2026-06

### What was done
- Installed react-router-dom for client-side routing
- Added Google Fonts CDN to index.html (Departure Mono, Geist, JetBrains Mono) and updated title to FLUME
- Replaced Vite default styles with full Flume design system in index.css (tokens, typography, base reset)
- Built AuthContext (src/context/AuthContext.jsx) — in-memory user state, login/logout, useAuth hook
- Built Login screen (src/pages/Login.jsx) — FLUME wordmark, eID input, Enter/button submit, validates against employees.json, IDENTITY NOT FOUND error state
- Built RoleDashboard (src/pages/RoleDashboard.jsx) — three tiles with independent activation logic, active/inactive visual states, auth guard
- Built three stub screens (Requestor, Approver, DeptAdmin) — role label, back button to dashboard, auth guard
- Wired routing in App.jsx: /, /dashboard, /requestor, /approver, /admin

### Key decisions
- dAdmin is a masterkey role — all three tiles (REQUESTOR, APPROVER, DEPT ADMIN) activate for dAdmin employees. Rationale: dAdmin needs full system visibility for demo walkthrough
- APPROVER tile activates for: PM, Principal, Partner, Practice Head, Line Manager, Dept Leader, Regional COO, Talent Manager — checked independently, not mutually exclusive with other tiles
- Auth state is in-memory React context only — no localStorage or sessionStorage. Re-login required on page refresh, acceptable for demo
- eID input normalizes to uppercase before lookup — EMP-0001 and emp-0001 both resolve correctly

### Notes
- MOD-003 delivery date reset to 2026-08-15 (had drifted to 2026-07-10 during Replit sync)
- src/data/ files pulled from Replit and pushed to GitHub at start of session
- Local dev uses HTTPS remote (SSH agent not persistent across shell sessions on Windows)

## SETUP-04 — Navigation shell and routing
**Status:** Shipped
**Date:** 2026-06

### What was done
- Added two layout components: PortfolioLayout (persistent top nav) and DemoLayout (auth scope + escape hatch)
- Portfolio routes: / (Problem), /approach, /decisions, /build — each renders a placeholder page
- Demo routes moved under /demo subtree: /demo, /demo/dashboard, /demo/requestor, /demo/approver, /demo/admin
- AuthProvider moved out of App root and into DemoLayout — auth state is fully scoped to /demo/*
- Portfolio nav uses NavLink with active state (cyan underline on active route)
- "← RETURN TO PRD" escape link fixed bottom-left on all /demo routes

### Key decisions
- AuthProvider scoped to DemoLayout, not App root — zero auth contact with portfolio routes
- Escape hatch text: "← RETURN TO PRD" (not "Back to portfolio")
- Escape hatch placement: fixed bottom-left — avoids conflict with existing demo page headers (top-right)

### Parked
- Portfolio nav visual polish — layout and functionality confirmed, styling to revisit before demo ships

## SETUP-05 — Design system implementation
**Status:** Shipped (as part of SETUP-03)
**Date:** 2026-06

### What was done
- CSS custom properties for full color palette (bg-base, bg-elevated, bg-card, borders, text, cyan, orange, magenta)
- Type stack loaded via Google Fonts CDN: Departure Mono (display/labels), Geist (body), JetBrains Mono (metadata/code)
- Base reset (box-sizing, margin/padding, font smoothing) and body defaults
- All tokens in use across Login, RoleDashboard, and stub screens from SETUP-03 onward

### Key decisions
- Shipped as part of SETUP-03 — design system was required to build the login screen, so the work happened together
- No formal spacing scale defined — ad-hoc values in component CSS, consistent with PRD which specifies no spacing system

## PE-01 — Early Flag Calculation
**Status:** Shipped
**Date:** 2026-06

### What was done
- Created `src/logic/` directory to hold policy engine functions separate from UI
- Built `calculateEarlyFlag(module, submissionTimestamp)` in `src/logic/earlyFlag.js`
- Returns `null` for type A modules (no calculation), `true` for type B with delivery ≥ 28 days from submission, `false` for type B with delivery < 28 days
- Both sides normalised to local midnight before comparison to eliminate DST / time-of-day drift
- Self-contained test block (`runEarlyFlagTests`) covers all three branches plus the 28-day boundary explicitly — runs via `node src/logic/earlyFlag.js`, 4/4 passing

### Key decisions
- Pure function with no UI dependencies — takes a module object and a timestamp, returns a flag value. Intentionally kept isolated so PE-02 can call it directly without touching any component state
- Local midnight normalisation on both sides: delivery_date parsed as `new Date(year, month-1, day)` (local), submission timestamp floored to midnight via `setHours(0,0,0,0)` — eliminates sub-day drift without requiring UTC gymnastics
- `Math.round` on the ms-to-days conversion handles DST transitions (23hr or 25hr days) cleanly at the boundary

### Notes
- Test block auto-runs on import — remove before wiring to submission flow (flagged with TODO comment in file)
- Submission timestamp uses `new Date()` client-side — known limitation, logged in Production Notes (Timestamp / Clock Trust)

## PE-02a — selectRule
**Status:** Shipped
**Date:** 2026-06

### What was done
- Created `src/engine/` directory to hold the policy engine separate from `src/logic/`
- Built `selectRule(staffType, moduleType, caseType, earlyFlag)` in `src/engine/policyEngine.js`
- Rule 5 (early flag bypass) checked first — earlyFlag true + moduleType B returns 5 regardless of staffType or caseType
- Rules 1–4 resolve from staffType + caseType combinations
- Invalid combinations throw with a descriptive error message
- Test block covers all five rules (8 cases total) plus one invalid input throw — 8/8 passing via `node src/engine/policyEngine.js`

### Key decisions
- Placed in `src/engine/` rather than `src/logic/` — engine is a distinct layer from utility logic (earlyFlag). The engine will grow to import data; logic functions stay pure/stateless
- Rule 5 guard is first to match the policy matrix bypass intent — early flag takes precedence over all staff/case type combinations
- Function is pure — no imports, no side effects, composable with PE-02b
- **PE-02 was consciously split into PE-02a (selectRule) and PE-02b (data layer + chain resolver).** Original card was a single M but contained two independently testable functions with different concerns — rule selection is pure logic, chain resolution requires data access. Splitting made each piece verifiable in isolation before wiring them together.

---

## PE-02b — resolveApproverData + resolveChain
**Status:** Shipped
**Date:** 2026-06

### What was done
- Added JSON imports (`employees.json`, `modules.json`) at the module level in `src/engine/policyEngine.js` — compatible with Vite and Node v24 via `with { type: 'json' }` import assertion
- Built `resolveApproverData(requestorId, moduleId)` — walks the requestor's `line_manager_id` chain upward to collect the full management chain, resolves the talent manager via `talent_manager_id`, and pulls the dAdmin from the module record. No raw employee records exit the function.
- Returns `{ staffType, managementChain, talentManager, dAdmin }` — only name and role label per person
- Built `resolveChain(ruleNumber, resolverData)` — pure function, takes rule number and the output of `resolveApproverData`, returns ordered array of `{ fullName, roleLabel, isStandIn }`
- Coverage gap: any unresolvable chain slot or null talent manager substitutes dAdmin with `isStandIn: true`; dAdmin always appears as the final entry — if dAdmin stands in earlier, both entries are kept (distinct decision steps)
- Test block covers all five rules plus one fabricated coverage gap (null TM on rule 2) — all outputs verified against policy matrix

### Key decisions
- `resolveApproverData` owns all data access; `resolveChain` is pure — clean separation means chain logic can be tested without touching the file system
- Management chain built by walking `line_manager_id` upward with a cycle guard — order reflects actual org structure, not hardcoded role assumptions. If the seed data hierarchy changes, chain resolution adapts automatically
- Talent manager resolved via `talent_manager_id` field on the requestor record (direct pointer), not by role search — deterministic, no ambiguity for employees who share a TM
- `isStandIn: true` chosen over omitting the slot — the UI needs to know a gap occurred and who is covering it, without re-deriving that information downstream
- Employee IDs do not appear in the output array — chain is safe to pass directly to UI components

### Notes
- Test block auto-runs on `node src/engine/policyEngine.js` — remove both PE-02a and PE-02b test blocks before wiring to submission flow
- `resolveApproverData` throws on missing requestor, module, or dAdmin — hard errors, not coverage gaps. Coverage gap only applies to mid-chain intermediary roles

## SETUP-06 — Case & Event write layer
**Status:** Shipped
**Date:** 2026-06

### What was done
- Created `src/context/CaseStoreContext.jsx` — in-memory runtime store for cases and events
- Module-level counters with zero-padded ID generators: `nextCaseId()` → `CASE-0001`, `nextEventId()` → `EVT-000001`
- `submitCase(caseData)` — generates case_id, stamps `initial_timestamp` and `most_recent_timestamp`, sets `current_status: 'pending'` and `current_approver_index: 0`, writes to cases array; simultaneously writes a `submission` event (sequence 0, actor = requestor, reason = requestor_reason) to events array
- `appendEvent(event)` — standalone writer for future approver and decision events without touching case records
- `useCaseStore()` hook for consumer access
- `CaseStoreProvider` wrapped into `DemoLayout` alongside `AuthProvider`, scoping the store to `/demo/*` only

### Key decisions
- Counter state lives at module level (not React state) so IDs never reset across re-renders — only a full page reload resets them, which is acceptable for demo
- `submitCase` writes both the case record and the submission event atomically (same function call) — submission is always event sequence 0
- `appendEvent` kept separate from `submitCase` so approver/decision events can be written by future cards without re-deriving case state
- Schemas match exactly what was locked in the snapshot — no new fields, no deviations

---

## SETUP-07 — Logout / identity switcher
**Status:** Shipped
**Date:** 2026-06

### What was done
- Added `logout` action to `AuthContext` — sets user to null, no other side effects
- Refactored `DemoLayout` to use an inner `DemoChrome` component so that `useAuth()` could be called inside the `AuthProvider` boundary (React context constraint)
- "SIGN OUT" button fixed bottom-right on all `/demo/*` screens — conditional on `user` being set, so it is invisible on the login screen itself
- On click: calls `logout()` and navigates to `/demo` with `{ replace: true }` — clears history entry so back-button does not re-enter the authenticated state

### Key decisions
- Inner component pattern (`DemoChrome` inside `DemoLayout`) chosen over lifting logout state — keeps auth logic fully inside the provider boundary, no prop drilling
- `replace: true` on navigate prevents the browser back button from returning to an authenticated screen after logout — important for demo where the recruiter is switching identities
- Button label: "SIGN OUT" (not "Logout" or "Switch User") — consistent with all-caps mono style, neutral enough to serve both genuine logout and identity-switching use cases
- Button is persistent across all demo screens including confirmation and form screens — recruiter can exit any flow cleanly without needing to complete a submission

---

## S-R1 — Requestor module filter view
**Status:** Shipped
**Date:** 2026-06

### What was done
- Upgraded `RequestorStub.jsx` from a placeholder to the real module selector view
- Reads authenticated user's `staff_type` from `AuthContext`, filters `modules.json` by `m.allowed_staff_type === user.staff_type`
- Renders a styled table with columns: MODULE ID, MODULE NAME, TYPE, DELIVERY DATE — field names pulled directly from modules.json schema
- Each row is clickable and navigates to `/demo/requestor/:moduleId` — module ID encoded in the route so the next screen can resolve the full module record
- Auth guard: redirects to `/demo` on mount if no user
- Back button navigates to `/demo/dashboard`

### Key decisions
- Filter is `allowed_staff_type` match only — no per-user module assignment list in seed data, staff type is the correct proxy for demo scope
- Route includes module ID as a URL param (`/demo/requestor/:moduleId`) rather than passing via router state — makes the URL bookmarkable and allows direct navigation during demo without needing to reconstruct state
- Stub pane created at the same time as the `CancellationStub.jsx` shell (pre-S-R2 landing page when a module row is clicked)

---

## S-R2 — Case type selection and reason field
**Status:** Shipped
**Date:** 2026-06

### What was done
- Built `SubmissionForm` (`src/pages/requestor/SubmissionForm.jsx`) as a standalone prop-driven component — receives `module` record and `onSubmit` callback; reads requestor identity from `AuthContext`
- Case type dropdown: Business / Personal only; textarea disabled until a case type is selected (prevents reason entry without context)
- Live character counter displayed below textarea (`{n} / 75`); helper text "Response length not met to submit." shown when between 1–74 characters; counter accent color shifts on threshold crossing
- Submit button disabled until `caseType !== ''` and `reason.length >= 75`
- On submit: runs full policy resolution synchronously — `calculateEarlyFlag` → `selectRule` → `resolveApproverData` → `resolveChain` — then passes resolved payload to `onSubmit`; no state writes happen inside `SubmissionForm`
- Built `CancellationStub.jsx` as the route-level wrapper — resolves the module record from URL params, passes it to `SubmissionForm`, handles submit by navigating to `/demo/requestor/confirm` with payload in router location state
- Built `SubmissionConfirmation` (`src/pages/requestor/SubmissionConfirmation.jsx`) as the post-submission read-only screen:
  - PENDING status bar showing first approver name and role label
  - Case details table: submission timestamp, module ID/name/type, requestor name/eID, case type, early flag row (type B modules only — shows "YES — RULE 5 APPLIED" or "NO")
  - Reason text block
  - Numbered approver chain list with STAND-IN badge on coverage gap entries
  - Redirects to `/demo/requestor` on direct navigation or page refresh (no state = no payload)
- Added new routes to `App.jsx`: `/demo/requestor/confirm` and `/demo/requestor/:moduleId`
- New CSS files: `SubmissionForm.css`, `SubmissionConfirmation.css`

### Key decisions
- Policy resolution runs inside `SubmissionForm.handleSubmit` before `onSubmit` is called — the form computes the resolved chain and passes it up; parent never touches the policy engine. Clean separation: form owns resolution, parent owns navigation and write
- `SubmissionConfirmation` reads payload exclusively from `location.state` — never from CaseStore — because the case write (S-R3) has not happened yet. Confirmation screen is a read of the resolved payload, not a read of persisted state
- Early flag row on confirmation is gated on `moduleType === 'B'` — type A modules never display this row, consistent with policy engine behavior (earlyFlag returns null for type A)
- `replace: true` is not used on the confirm navigation — the requestor should be able to hit back from the confirmation screen to review their form before it is finalized (case write happens at S-R3, not here)
- Confirmation screen shipped as part of S-R2 because it is the natural end of the form flow and cannot reasonably be split from it — the form with no post-submit feedback would not constitute a shippable state

---

## S-R3 — Auto-routing on submission
**Status:** Shipped  
**Date:** 2026-06-09

### What was done
- Updated `appendEvent` in `CaseStoreContext.jsx` to auto-generate `event_id` internally — callers pass event data without an ID; the module counter stamps it
- Moved `nextEventId()` outside the `setEvents` updater function — updaters must be pure; React StrictMode double-invokes them in dev, which caused the counter to skip a value (EVT-000002 lost, notification landed as EVT-000003). Moving ID generation outside the updater fixed the skip
- Wired `useCaseStore` into `CancellationStub.jsx` — on form submit, `handleSubmit` now:
  1. Maps the camelCase SubmissionForm payload to locked snake_case case schema fields and calls `submitCase` (returns `case_id`)
  2. Calls `appendEvent` with `actor_id: 'SYSTEM'`, `event_type: 'notification_sent'`, `sequence_number: 1`, reason: `"Notification sent to [first approver full name] ([role label]). Production: Microsoft Teams."` — first approver pulled directly from the already-resolved `approverChain` in the payload
  3. Navigates to the confirmation screen with the original camelCase payload in `location.state`
- `SubmissionConfirmation.jsx` untouched — continues reading from `location.state` only
- Verified in browser console: one case record (`current_status: 'pending'`, `current_approver_index: 0`), two events (sequence 0 submission + sequence 1 SYSTEM notification with correct first approver name, role label, and Teams callout)

### Key decisions
- `appendEvent` auto-generates `event_id` rather than requiring callers to import the counter — consistent with how `submitCase` handles ID generation, keeps the counter fully encapsulated
- Payload mapping from camelCase (SubmissionForm output) to snake_case (case schema) is the responsibility of `CancellationStub.handleSubmit`, not the form — SubmissionForm is unchanged
- `approver_chain` stored on the case record alongside the locked schema fields — required for approver flow routing (`current_approver_index` indexes into it)
- No UI changes — S-R3 is write layer only. Console-verified. Visual surface for event history ships in S-R4

---

## S-R4 — Requestor status dashboard
**Status:** Shipped  
**Date:** 2026-06-09

### What was done
- Created `src/pages/requestor/RequestorDashboard.jsx` — the requestor's case status view, routed at `/demo/requestor/dashboard`
- REQUESTOR tile on the role select screen now routes to `/demo/requestor/dashboard`; module selector at `/demo/requestor` is only reachable via "Create a Case" button
- Dashboard title: "Current Cancellation Requests" with a chamfered orange "Create a Case" button upper-right (same clip-path as submission form's active button)
- Case rows filtered from `CaseStoreContext` by `requestor_id === user.employee_id`; columns: expand indicator (`+` / `−`), Case ID, Module, Case Type, Submitted, Delivery Date, Status, Current Holder
- Submitted column: formatted from `case.initial_timestamp`; Delivery column: `delivery_date` from module record
- Status rendered as a hard-edged pill (`border-radius: 0`) — pending: orange; approved: cyan; denied: magenta
- Current Holder: `approver_chain[current_approver_index].fullName` + `roleLabel` label
- Clicking any row expands it inline to show the case's full audit log; clicking again collapses. Expand indicator turns cyan on hover and when open
- Audit log: events sorted by `sequence_number` ascending; resolves `actor_id` to display name + role label (no eIDs rendered anywhere in this view); `notification_sent` events render a "PRODUCTION: MICROSOFT TEAMS" callout badge
- Actor resolution: `SYSTEM` → "System / System"; requestor actor → name from employees.json + "Requestor" label; all others → name + role from employees.json
- Empty state: dark elevated surface with "NO ACTIVE CASES." in display mono
- Added `Case Summary` page title to `SubmissionConfirmation`; back button on confirmation now routes to `/demo/requestor/dashboard` (was `/demo/requestor`)
- Demo chrome buttons (RETURN TO PRD, SIGN OUT) redesigned: larger text (11px), more space from screen edge (28px), chamfered clip-path outline with bg-elevated fill and border-hard border. Hover: border and text shift to cyan. Bottom padding on `.rd-content` (88px) ensures content never runs under the fixed chrome

### Key decisions
- eID display rule enforced at the component level — `resolveActor()` takes `actor_id` and the case record, maps to display name + role label, never surfaces eIDs in output. Matches the eID display rules locked in the 2026-06-09 session update
- `approver_chain` entries do not carry employee IDs (by policy engine design), so actor resolution for future approver events uses employees.json lookup by `actor_id`. Submission event is detected by matching `actor_id === caseRecord.requestor_id`; SYSTEM events are detected by string equality
- "Create a Case" reuses the chamfered button clip-path from `SubmissionForm.css` — styles duplicated to `.rd-create-btn` in `index.css` rather than creating a cross-file CSS dependency
- colSpan on the expanded log row set to 8 (matching the 8-column header: expander + 7 data columns)
- Back button relabeled "← ROLE SELECT" instead of "← DASHBOARD" — avoids confusion between the role select screen and this dashboard, which has its own stronger claim to the word "dashboard"

---

## Session Update — 2026-06-09

## S-R5 — Submission in under 5 minutes
**Status:** Shipped  
**Date:** 2026-06-09

### What was done
- Moderated usability test completed with real users against the live S-R4 build
- Full submission flow (login → module select → case type + reason → submit → confirmation) completed in under 5 minutes across test participants

### Acceptance criteria met
- A-R5: usability test with real users confirms full submission flow completed in under 5 minutes. ✓

### Notes
- No code changes — S-R5 is a UX validation milestone, not a build card
- Test conducted against the S-R4 build; no regressions observed

---

### Build State
- SETUP-01 through SETUP-07: Shipped
- PE-01, PE-02a, PE-02b: Shipped
- S-R1, S-R2, S-R3, S-R4, S-R5: Shipped
- Next: Approver Flow (S-A1 → S-A4) → dAdmin Flow → AL-01 checkpoint → Portfolio Site

### Decisions made this session

#### Notification inbox killed (NI-01 → Won't Do)
Mock email inbox removed from scope. Two reasons: theater risk (a recruiter immediately reads a fake email client as simulated, not functional) and confusion risk during seeded demo walkthrough (inbox looked like a distinct product surface, not a routing feature). Replaced by system event entries written to the audit log at every routing step — `actor_id: 'SYSTEM'`, `event_type: 'notification_sent'`, reason containing the target approver's full name, role label, and a forward-looking callout: "Production: Microsoft Teams." This keeps the notification story honest without simulating a channel. Logged on PO-02 as decision 4.

#### Audit log display distributed across persona dashboard cards (AL-02 → Won't Do)
AL-02 was a standalone card for audit log display on case views. Killed and redistributed. Each persona dashboard now owns its own role-filtered display:
- S-R4 (requestor dashboard): name, role, timestamp, event type, reasoning. No eIDs. System notification events show Teams callout.
- S-A1 (approver case view): same rules as requestor. Prior approver reasoning visible — this is the social pressure anti-rubber-stamp mechanism.
- S-D2 (dAdmin view): full log including eIDs. Only role where eIDs render.

eID display rules locked:
- eIDs never render outside dAdmin audit log view
- Requestor's own eID visible only on signed-in identity display and case submission summary
- All other views: name + role + timestamp + event type only

#### AL-01 rescoped to verification checkpoint (XS)
Write layer is no longer standalone work. Submission event (seq 0) and system notification event (seq 1) write in S-R3. Approver decision events write in S-A3. dAdmin signoff event writes in S-D4. AL-01 is now a verification checkpoint only: confirm event writes land correctly across all flow cards before CP-02. No new code.

#### S-A1 rescoped and resized (S → M)
Original scope was mock inbox with direct case link — killed with NI-01. Card fully rewritten. Now owns: (1) pulse animation and pending case counter on the APPROVER role dashboard tile when cases are awaiting the authenticated user's approval, and (2) role-filtered audit log display on the approver case view. Pending count derived at render time by scanning cases where `current_approver_index` in the resolved chain matches the authenticated user's eID.

#### S-D2 rescoped
Absorbs dAdmin-side audit log display from AL-02. Full log including eIDs. Pulse + counter on DEPT ADMIN tile for cases awaiting final signoff. Same tile pattern as S-A1.

#### Case store persistence — intentionally in-memory (logged on PO-02 as decision 5)
Case and event state lives in React context only. No localStorage, sessionStorage, or external database. Rationale: each recruiter running the demo gets a clean isolated state with no risk of stale data from a prior session or conflicts from a concurrent viewer. In-memory state survives persona switches (client-side navigation, no page reload) cleanly. Known limitation: full page refresh resets all case state — flagged in demo README. Production path: replace in-memory store with real database; context layer acts as interface boundary so the swap requires no changes to consuming components.

#### S-R3 scope clarified
Write layer only. On submission: (1) write case record to store via `submitCase`, (2) confirm submission event writes as sequence 0, (3) write system notification event as sequence 1 via `appendEvent`. No UI changes. No dashboard work. Console-verified only until S-R4 ships. Inbox reference removed from card — old acceptance criteria referenced NI-01 inbox stub which is now killed.

### Notion board changes
- NI-01: Won't Do
- AL-02: Won't Do
- AL-01: Rescoped to XS verification checkpoint, unblocked
- S-R4: Implementation notes and acceptance test updated to include role-filtered audit log display and Teams callout
- S-A1: Fully rewritten, resized S → M
- S-D2: Rescoped to include pulse/counter tile and full dAdmin audit log
- PO-02: Decisions 4 (inbox kill) and 5 (in-memory persistence) added

### Parked
- README draft (demo instructions, session persistence warning, suggested test flows) — defer until all flow cards shipped

**Resume at: S-A1 — Approver case view (role-filtered audit log display + decision interface). Tile pulse/counter shipped this session. See session update below.**

---

## Session Update — 2026-06-09 (evening)

### Build State
- SETUP-01 through SETUP-07: Shipped
- PE-01, PE-02a, PE-02b: Shipped
- S-R1 through S-R5: Shipped
- S-A1 tile component (pulse + counter): Shipped. Approver case view still to do.
- Next: S-A1 approver case view → S-A2 → S-A3 → S-A4 → dAdmin flow

### What was built this session

#### policyEngine.js — eID added to chain entries
`resolveApproverData` now includes `eID: emp.employee_id` on each entry in `managementChain`, on `talentManager`, and on `dAdmin`. `resolveChain` propagates these through `slot()`, `tmSlot()`, and `dAdminFinal`. Each chain entry returned is now `{ fullName, roleLabel, eID, isStandIn }`.

eID audit performed across all rendering components — no violations found:
- `RequestorDashboard`: renders `holder.fullName` and `holder.roleLabel` only
- `SubmissionConfirmation`: renders `approver.fullName`, `approver.roleLabel`, `approver.isStandIn` only
- `RoleDashboard`: reads `eID` for identity match only, does not render it

#### RoleDashboard.jsx — tile redesign + S-A1 pulse/counter
- Action verbs replace role name labels: REQUESTOR → "REQUEST A CANCELLATION", APPROVER → "REVIEW PENDING DECISIONS", DEPT ADMIN → "MANAGE MODULES"
- Tiles redesigned as chamfered octagons using a 3-layer CSS structure (see below)
- `useCaseStore` imported; `pendingForUser` derived by filtering cases where `current_status === 'pending'` and `approver_chain[current_approver_index].eID === user.employee_id`
- When `pendingForUser > 0` and approver tile is active: tile gets pulse animation and counter text ("N CASE / CASES AWAITING REVIEW") — this is the S-A1 tile component
- dAdmin tile pulse/counter deferred to S-D2

#### index.css — 3-layer tile structure
Border-on-chamfer requires three nested elements because `clip-path` clips `border` and `box-shadow` to straight-edge geometry only. Structure:
- `tile-outer` — no clip-path; holds `filter: drop-shadow()` for outer glow animation
- `tile-wrap` — `clip-path` octet polygon at 24px chamfer; `background: var(--cyan)` with `padding: 2px` acts as the border
- `tile` — inner fill with `clip-path` octet polygon at 17px chamfer; background: `var(--bg-card)`

The inner clip-path at 17px on the inner box places its diagonal at `x+y=21` (outer coords), vs. the outer diagonal at `x+y=24` — ~2px perpendicular gap visible as cyan border on all 8 edges, including diagonal cuts. Pulse: `filter: drop-shadow()` glow on `tile-outer` + layered inset `box-shadow` on `tile`, both on 1.6s cycle.

### Parked this session
- **Tile border on chamfered edges not visually confirmed** — the geometry is correct on paper (inner clip-path at 17px gives ~2px perp gap on diagonals) but visual result not confirmed to be working properly in browser. Parked to save time. Revisit if the recruiter demo walkthrough needs polish before ship.

### Decisions made this session
- **Action verbs replace role names on tiles** — the label conveys what the tile does, not what the user is. Cleaner information hierarchy.
- **eID included in chain entries** — needed for approver identity matching without a separate lookup at every render. eID stays in the data layer; display layer rules unchanged.
- **dAdmin tile pulse/counter deferred** — S-D2 scope, not S-A1. Keeps card boundaries clean.
