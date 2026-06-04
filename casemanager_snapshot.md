# CaseManager — PRD Snapshot & Context Handoff

**Status:** PRD complete, demo build pending  
**Date:** May 2026  
**Author:** [Your name]  
**Version:** 0.1 — pre-build

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

*Resume at: SETUP-05*
