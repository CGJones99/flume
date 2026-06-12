# FLUME — Product Requirements Document

**Author:** Connor
**Version:** 1.0 — core demo flows shipped, portfolio site in progress
**Status:** In build (living document — see Section 12)
**Next:** Portfolio site (PS-01 → PS-05)

Structured case management for exception requests in cost-center departments. Replaces email chaos with auditable, auto-routed approval chains — so leadership stops chasing and starts enforcing.

---

## Contents

1. Problem Statement
2. Product Goals
3. Personas
4. User Stories & Acceptance Criteria
5. Policy Matrix
6. Scope
7. Open Questions & Decisions
8. Success Metrics
9. Technical Assumptions
10. Demo Seed Data
11. Build Stack
12. Build Evolution Log

---

## 01 / Problem Statement

A cost-center department's budget is not being spent effectively due to a high-friction manual process to request exceptions to resource commitments — a process so painful that staff are discouraged from even trying to comply with policy.

That process is entirely run through email, relies on individual interpretation of policy, and has no auditability. As a result, leadership has no view into the process. They can neither support the managing department nor address problematic teams.

---

## 02 / Product Goals

1. Automatic routing eliminates manual chasing at every stage of the process.
2. Audit log eliminates excuses — every delay has a named, identifiable responsible party.
3. 90% of cases close in under one day. *(External dependency: approver responsiveness. Product owns the tooling, not the behavior.)*
4. Uptime and ease of use high enough to support chargeback enforcement — no room to push back on process grounds.
5. Dept admins spend at most 10 minutes per day managing cases in the tool.
6. Requestors submit a case in under 5 minutes (validated via usability testing).
7. Approvers reach a fully informed decision in under 5 minutes from a single screen, no external context required.

---

## 03 / Personas

Five personas. Three are MVP. Two are documented for future scope.

### Requestor (MVP)
- **Need:** Frictionless submission. Real-time status visibility.
- **Motivation:** Will not engage unless effort is minimal. Historically no consequence for non-compliance. Needs CYA visibility — it can't be their fault if someone gets mad.
- **Failure mode:** High friction → non-compliance. Status opacity → disputes.

### Approver (MVP)
- **Need:** Information efficiency. Single-screen decision with full context.
- **Motivation:** Overworked. Will blanket-approve unless friction is low and context is clear. Needs to see who they're accountable to.
- **Failure mode:** Information overload → rubber stamping. Slow notification → delayed chain.

### Dept Admin / dAdmin (MVP)
- **Need:** Process clarity. Centralized case visibility by module.
- **Motivation:** This is the most painful part of their job. Wants to be a gatekeeper, not an errand runner.
- **Failure mode:** Too many screens or manual steps → back to email.

> **As-built note (2026-06-10):** The original framing of dAdmin as a single, undifferentiated "gatekeeper" persona undersold a real distinction that only became visible once the approver and dAdmin flows were both built: a dAdmin can show up on a case in *two different capacities* — as a regular intermediary approver (e.g. standing in for a vacant role via the coverage-gap clause) and separately as the *final* gatekeeper on their own modules. SETUP-03 had originally treated dAdmin as a flat "masterkey" role with access to all three dashboard tiles. Once both flows existed side-by-side, a dAdmin would see the same pending case pulse on both their APPROVER and DEPT ADMIN tiles, and could action a final-signoff case through the lower-friction approver screen — wrong character minimums, no eID visibility, wrong semantics. See Section 12 (Role Separation) for the fix. This is now reflected as an implicit dual-mode behavior of the dAdmin persona, not a documentation change to the persona card itself — the *need* and *motivation* above still hold, but "gatekeeper" now means two distinct UI surfaces depending on the case's position in the chain.

### Firm Leadership (Future)
- **Need:** Information quality. Exception surfacing. Confidence in data integrity.
- **Motivation:** Cost center oversight. Zero-learning-curve required. Problems should surface to them, not require hunting.
- **Failure mode:** Opaque data → can't act on problem teams.

### Sysadmin / sAdmin (Future — Partial MVP)
- **Need:** System configuration. Coverage management. Routing rule ownership.
- **Motivation:** Nerve center. Must assign dAdmins to modules, manage coverage gaps, and push policy matrix updates (with dept leadership confirmation).
- **Failure mode:** Config errors break routing for every downstream user.
- **Note:** 2-3 sAdmins planned for coverage redundancy.

---

## 04 / User Stories & Acceptance Criteria

> **As-built note:** All stories below shipped. A handful evolved in scope, were split, merged, or renumbered once they were built against each other — those changes are called out inline and summarized in Section 12. The acceptance criteria as written here remain the locked target; where the shipped implementation differs in a way worth a recruiter or reviewer noticing, it's flagged.

### Requestor

**S-R1**
As a requestor, I want to see only the modules I am assigned to so that I can quickly identify what to submit a case for without searching through irrelevant options.

*Acceptance:* Given authentication of user, when a user begins a case submission, then they can only see modules relevant to them, constraining their options.

> **Shipped.** Filter implemented as `allowed_staff_type` match against the module record (no per-user module assignment list exists in seed data — staff type is the correct proxy at demo scope).

**S-R2**
As a requestor, I want to select a case type and submit a short reason so that I can complete a submission quickly without being slowed down by unnecessary fields.

*Acceptance:* Given a module selection, when a user defines their case, then they will only see a limited dropdown of case types with a mandatory but limited free response explanation (75 character minimum).

> **Shipped**, including the post-submission confirmation screen as a natural extension of this card (a form with no feedback on submit isn't a shippable state).

**S-R3**
As a requestor, I want the system to automatically route my case to the correct approvers based on policy so that I don't have to interpret rules or determine who needs to sign off.

*Acceptance:* Given a case type selection and user authentication, when the user submits the case, then they are shown the correct sequence of approvers and the request is sent to the first in the chain.

> **Shipped.** "Sent to the first in the chain" is realized as a `notification_sent` audit log event naming the first approver — see Section 12, Notification Inbox Kill.

**S-R4**
As a requestor, I want to see the current step, responsible party, and full history of my case at any time so that I can identify who is creating delays and demonstrate I am not the blocker.

*Acceptance:* Given a submitted case, when the user revisits the tool, then the user can view a status dashboard showing in real time who has the request and how many steps remain. Approver names are visible (not role only).

> **Shipped**, and absorbed the audit log display responsibility originally scoped to a standalone AL-02 ticket — see Section 12.

**S-R5**
As a requestor, I want to submit a case in under 5 minutes so that I can stay compliant without it competing with my primary work.

*Acceptance:* Given a compliant user, when a user endeavors to submit a case, then a usability test with real users confirms the full submission flow can be completed in under 5 minutes.

> **Shipped (validated).** Moderated usability test against the live S-R4 build confirmed the full login → module select → submission → confirmation flow completes in under 5 minutes.

**S-R6**
As a requestor, I want to receive a notification with the final decision and reasoning when my case closes so that I understand the outcome and have a record if the decision is disputed.

*Acceptance:* Given a decision on a case, when a user receives a notification, then they will see a log of who decided on the case and what their reasoning was.

*Note: Notification channel: email for demo, Teams/Slack for production.*

> **Shipped — satisfied without a standalone build.** When a case reaches a terminal state (approved or denied), the requestor dashboard immediately reflects the new status pill and full audit log on next render via the in-memory case store. The `notification_sent` system event carries the "what would have been sent" record. No separate notification surface was built — see Section 12, Notification Inbox Kill.

> **New (S-R7, not in original scope):** A "Past Cases" section was added to the requestor dashboard, splitting cases by terminal vs. active status, with the same role-filtered audit log on each closed case. This emerged directly from S-D5's symmetric active/past pattern on the dAdmin side — once that existed, the requestor dashboard needed the same separation to stay legible as case volume grew. Effectively, S-R7 is what makes S-R6 *navigable* once a requestor has more than one case.

> **New (S-R8, not in original scope):** A read/unread pulse mechanism on the REQUESTOR tile (cyan pulse, "N DECISIONS TO REVIEW") and on individual past-case rows, so a requestor returning to the tool after a case closes is drawn directly to the outcome. This is the more literal interpretation of "receive a notification" given that there is no external channel in the demo — the *system* surfaces the decision proactively rather than requiring the requestor to go looking for it.

### Approver

> **As-built note:** The original four approver stories (S-A1–S-A4) were restructured during build once it became clear the original split didn't match the natural UI boundaries. See Section 12 for the full renumbering rationale. The acceptance criteria below are presented in their **original** form for traceability; the "Shipped as" notes describe where each requirement actually landed.

**S-A1**
As an approver, I want to receive a notification that links me directly to the case so that I can quickly navigate to it in the flow of work.

*Acceptance:* Given a notification is sent, when the approver views it, then there is a direct link to the case view within it.

> ~~**Shipped as:** Mock inbox with direct case link.~~ **Killed and rewritten (NI-01 → Won't Do).** The "notification with a link" concept was replaced by: (1) a pulse animation + pending-case counter on the APPROVER role-dashboard tile (shipped as **S-A1a**) when cases await the authenticated user's decision, and (2) a dedicated pending-cases dashboard listing those cases with direct navigation into each (shipped as **S-A1b**). The "link" is structural — the tile *is* the entry point — rather than a simulated message. See Section 12, Notification Inbox Kill, for why a literal mock inbox was rejected.

**S-A2**
As an approver, I want to see the full case context including requestor details and prior decision history so that I can make a fully informed decision without referencing anything else.

*Acceptance:* Given a portal link is opened, when the approver hits the case view page, then they see the requestor, case details, case type, and a decision log of previous approvers with their roles and reasoning.

**S-A3**
As an approver, I want to be able to quickly decide while giving my reasoning so that I don't burn too much of my own time and support proper resource allocation.

*Acceptance:* Given a portal link is opened, when the approver hits the case view page, then there is an approve/deny action and a mandatory reason field requiring a minimum of 100 characters before submission is enabled.

> **S-A2 and S-A3 shipped as a single screen, renumbered to S-A2.** During build it became clear these were never two screens — "see full context" and "decide with reasoning" describe the same case view with two halves (left: case details + audit log; right: decision panel). Splitting them had been an artifact of story-writing, not a real product boundary. The merged screen shipped as the new **S-A2 — Approver case detail view**, with the audit log fully role-filtered (prior approver reasoning visible — this is the anti-rubber-stamping mechanism from Decision #16 in Section 7).

**S-A4**
As an approver, I want the process to continue automatically after I provide my input so that I don't need to be concerned about next steps.

*Acceptance:* Given a response submitted by an approver, when the response is evaluated, then it will either auto-route to the next sequential approver or terminate early and return to the requestor in the case of a denial — with full decision log attached.

> **Shipped, renumbered to S-A3.** On approval, `current_approver_index` advances; if the chain is exhausted the next "approver" is the dAdmin (no special-casing required — dAdmin is simply the last chain entry). On denial, `current_status` is set to `denied` immediately, terminating the chain. Both paths write a `notification_sent` system event with distinct phrasing (approval names the next approver; denial names the requestor).

### Dept Admin

> **As-built note:** S-D3 evolved significantly once the approver flow existed to route into it — see the as-built note below and Section 12 (Role Separation).

**S-D1**
As a dAdmin, I want to view all modules I am responsible for upon authentication so that I can focus on only the things that require my specific attention.

*Acceptance:* Given a user authenticates and has the dAdmin role, when the user opens the module admin view, then they see only the modules they are responsible for and cases tied to those modules.

> **Shipped.** Module list filtered to `dadmin_id === user.employee_id`. Modules with at least one case at the dAdmin's own decision stage pulse orange.

**S-D2**
As a dAdmin, I want to quickly monitor cases for my module so I can see if certain modules are becoming hotspots.

*Acceptance:* Given a dAdmin signs into their modules dashboard, when they see their assigned modules, then they can see active cases for each, who is requesting, and what process step they are on.

> **Shipped**, and absorbed the dAdmin-side audit log display originally scoped to AL-02 (full log including eIDs — the only view where eIDs render). See Section 12.

**S-D3**
As a dAdmin, I want to be notified as the final approver in all cases that have secured all other approvals so that I can act as gatekeeper and ensure policy is enforced correctly.

*Acceptance:* Given a case that has secured all other approvals, when the logic engine evaluates, then it sends to the named dAdmin that manages said module for final signoff with the full audit chain visible.

*Note: dAdmin is always the final approver unless early termination (denial) occurs earlier in the chain.*

> **Shipped — satisfied entirely by S-A3's routing logic, no standalone build.** When the last intermediate approver approves, `current_approver_index` advances to the dAdmin slot automatically (dAdmin is just the final chain entry), and the existing `notification_sent` system event records the dAdmin's name and role. The DEPT ADMIN tile then pulses. This is a case of an acceptance criterion being fully met by a generic mechanism built for a different story — flagged here so it doesn't read as "not done."

**S-D4**
As a dAdmin, I want to confirm that I have committed approved allocation changes so that there is a record that the change was actually processed.

*Acceptance:* Given a request has received dAdmin final signoff, when the dAdmin completes their signoff, then they are provided a structured dropdown affirmation step (options: policy satisfied / expedited / special case). On approval, a completion timestamp is added to the audit log. On denial, a minimum 200 character written reason is required. Signoff triggers case closure, requestor notification, and an audit log entry.

> **Shipped as specified.** Approval path requires a structured dropdown selection (Policy Satisfied / Expedited / Special Case) plus an "I have processed the cancellation in the allocation system" checkbox before submission is enabled. Denial path requires a 200-character minimum written reason (the checkbox is conditionally absent on the denial path, not just disabled). Signoff writes the decision event, a `notification_sent` system event to the requestor, sets `current_status` to `fully_approved` or `denied`, and stamps `most_recent_action`/`most_recent_timestamp`.

---

## 05 / Policy Matrix

The early flag is calculated by the system, not declared by the requestor (exploit prevention). If module type is **B** and delivery date is more than 4 weeks from submission, early flag = **YES**.

| Staff | Module | Case | Early | Approver Chain | Final |
|---|---|---|---|---|---|
| Consultant | A | Business | n/a | PM → Principal → Partner → Practice Head | dAdmin |
| Consultant | A | Personal | n/a | PM → Talent Manager | dAdmin |
| Support | A | Business | n/a | Line Mgr → Dept Leader → Regional COO | dAdmin |
| Support | A | Personal | n/a | Line Mgr → Talent Manager | dAdmin |
| Consultant | B | Business | No | PM → Principal → Partner → Practice Head | dAdmin |
| Consultant | B | Personal | No | PM → Talent Manager | dAdmin |
| Support | B | Business | No | Line Mgr → Dept Leader → Regional COO | dAdmin |
| Support | B | Personal | No | Line Mgr → Talent Manager | dAdmin |
| Consultant | B | Business | Yes | (bypass all) | dAdmin only |
| Consultant | B | Personal | Yes | (bypass all) | dAdmin only |
| Support | B | Business | Yes | (bypass all) | dAdmin only |
| Support | B | Personal | Yes | (bypass all) | dAdmin only |

### Effective Rule Set

Five rules plus the early-flag bypass:

1. **Consultant + Business** (A or B, no early flag): PM → Principal → Partner → Practice Head → dAdmin
2. **Consultant + Personal** (A or B, no early flag): PM → Talent Manager → dAdmin
3. **Support + Business** (A or B, no early flag): Line Manager → Dept Leader → Regional COO → dAdmin
4. **Support + Personal** (A or B, no early flag): Line Manager → Talent Manager → dAdmin
5. **Any + Module B + Early flag:** dAdmin only (all intermediaries bypassed)

> **Out of demo scope**
> Specialists are omitted (function like Support in 95% of cases — noted for production documentation). Consultant seniority routing is also omitted: adds build complexity without sufficient portfolio value.

> **As-built note:** The matrix above shipped exactly as specified — `selectRule()` checks Rule 5 (early flag bypass) first regardless of staff/case type, then resolves Rules 1–4 from staff type + case type. The split into **PE-02a** (rule selection — pure function, no data access) and **PE-02b** (chain resolution — walks the org hierarchy via `line_manager_id`, resolves talent manager and dAdmin) is a build-time decomposition, not a policy change. See Section 12 for why that split happened and why it mattered. One addition not visible in the matrix: any unresolvable chain slot (coverage gap, e.g. a null talent manager) substitutes the dAdmin with an `isStandIn: true` flag, surfaced to the requestor as a "STAND-IN" badge — this is the UI expression of Decision #12 in Section 7, and is discussed as a forward-looking redundancy guarantee in Section 12 (Fallback rule: unresolvable chain slot routes to dAdmin).

> **Framing note: this matrix is a configuration, not a hardcoded shape.** The point of resolving rules in two layers — pure rule selection (PE-02a) against a small lookup table, and chain resolution (PE-02b) against the org hierarchy and role labels — is that both layers are designed to be data-driven. Rule selection is a small table keyed on staff type, module type, case type, and early flag; adding, removing, or reweighting rules means editing that table, not the selection logic. Chain resolution walks role relationships (`line_manager_id`, `talent_manager_id`, `dadmin_id`) rather than hardcoding "PM → Principal → Partner" as a literal sequence of role names — so a new approval path, a new role in an existing chain, or a different chain entirely for a new department is a data change, not a code change to the engine itself. The demo ships with the 5 rules above preloaded and not exposed via UI (Decision #3, #5 — sAdmin owns this in production), but the underlying engine is intentionally modular: the architecture is the product decision here as much as the specific 5-rule policy is.

---

## 06 / Scope

### In Scope — MVP Demo
- Requestor submission flow
- Approver decision flow (single-screen, full context)
- dAdmin case management view and final signoff
- End-to-end case completion: full approval and early termination paths
- Policy engine (preloaded, not configurable via UI)
- Audit log on every case
- ~~In-app notification inbox (mock email — shows what would have been sent)~~
- Seed data for 4 testable policy flows + 1 mid-chain rejection
- Simple eID login (select from user list, no SSO)

> **Scope change (2026-06-09): notification inbox killed (NI-01 → Won't Do).**
> The mock email inbox was removed from scope entirely — not deferred, not descoped-down, removed. Two reasons: (1) **theater risk** — a recruiter clicking into a fake email client immediately reads it as simulated rather than functional, which undercuts the credibility of the rest of the demo; (2) **confusion risk** — during a seeded walkthrough, an inbox looks like a *separate product surface* rather than what it actually represents, which is routing. It was replaced by `notification_sent` system events written to the audit log at every routing step (`actor_id: 'SYSTEM'`, reason naming the target's full name, role label, and a forward-looking "Production: Microsoft Teams" callout). This keeps the notification story honest — it shows *that* and *to whom* a notification would fire, without pretending to render one. Full reasoning in Section 12.

> **Scope addition (not in original PRD): Active/Past case sections.** Both the requestor dashboard (S-R7) and the dAdmin module/case views (S-D5) gained a split between active/open and past/closed records, each independently scrollable with header counts. This wasn't requested by any single story — it emerged because once cases could actually reach a terminal state (S-A3, S-D6), an undifferentiated list became unusable as a demo walkthrough device. Documented here because it's now load-bearing for S-R6/S-R8 and for the dAdmin's "is this module a hotspot" need (S-D2).

### Out of Scope — Voice-Over Only
- Sysadmin configuration UI
- Leadership dashboard and reporting
- Real integrations (Tableau, Teams, Slack, email)
- Policy matrix configuration screen
- Real employee directory hook
- Chargeback enforcement tooling

---

## 07 / Open Questions & Decisions

All sixteen items below are locked. Re-opening requires explicit flag.

| # | Question | Decision |
|---|---|---|
| 01 | Notification channel | Email for demo. Teams/Slack for production. ~~In-app mock inbox preferred over live email in demo.~~ **Superseded — see Section 6 scope change.** Notification record now lives entirely in the audit log as `notification_sent` system events; no inbox surface, mock or otherwise, was built. |
| 02 | Case types | Binary: Business or Personal. Fixed, not configurable in demo. |
| 03 | Module assignment | Controlled by sAdmin. Preloaded for demo. |
| 04 | dAdmin always final approver? | Yes, unless early termination (denial) occurs — the only exception. |
| 05 | sAdmin policy matrix updates | Requires dept leadership confirmation before pushing. Out of scope for demo. |
| 06 | Stall notification threshold | 72 hours. Notifies both requestor and dAdmin. Configurable in future. **Out of demo scope.** This requires a time-based trigger (a case sitting unactioned for 72 hours) which has no meaning in a single-session, in-memory demo — there's no elapsed real time to monitor across a walkthrough. The policy remains locked for production: a stalled case notifies both requestor and dAdmin, with the threshold configurable by sAdmin. |
| 07 | Approver minimum reason length | 100 characters. Applies to all approvers. |
| 08 | dAdmin signoff format | Structured dropdown for approvals (policy satisfied / expedited / special case). Denial requires 200 char min written reason. **Shipped as specified** — see S-D4 in Section 4. |
| 09 | Requestor reason minimum | 75 characters. |
| 10 | Denial behavior | Any denial at any stage terminates the chain. Case returns to requestor with full decision log. dAdmin is skipped only in this scenario. |
| 11 | Database sync cadence | Weekly. In-flight cases lock to submission-time delivery dates. New submissions use updated dates. |
| 12 | Coverage gap behavior | If approver is on leave/terminated, system skips them and flags to dAdmin. ~~Stall notification triggers collaborative resolution.~~ Requestor cannot flag coverage gaps at submission (exploit prevention). **Shipped** as the `isStandIn` flag in `resolveChain()`, surfaced as a "STAND-IN" badge on the requestor's approver-chain view. The skip-and-flag behavior is independent of the stall notification (#6, out of demo scope) — coverage gaps are resolved at routing time, not via a time-based trigger, so this shipped without depending on #6. Generalized in Section 12 as a routing-redundancy guarantee: any unresolvable chain slot, not just leave/termination, falls back to dAdmin. |
| 13 | Approver name visibility | Full name visible to requestor on status view. Not role only. |
| 14 | Concurrent submissions | Allowed. A requestor may have multiple active cases across modules simultaneously. |
| 15 | In-flight delivery date changes | Cases in flight lock to submission-time dates. Date changes only affect future submissions. |
| 16 | Rubber-stamping risk | Social pressure: approver reasoning visible to subsequent approvers and dAdmin. 100 char min enforces minimum thought. dAdmin acts as final quality gate. **Shipped** — enforced at a single component boundary (`CaseHistory`), see Section 12. |

> **New locked decision (2026-06-09), not in original 16: eID display rules.**
> eIDs never render outside the dAdmin audit log view. A requestor's own eID is visible only on their signed-in identity display and case submission summary. All other views show name + role + timestamp + event type only. This wasn't an open question in the original scoping — it emerged from the practical question of "what does each persona's audit log actually show," and was resolved by building a single shared `CaseHistory` component with a `showEid` prop, so the rule is structural rather than a convention that has to be remembered at every call site.

---

## 08 / Success Metrics

| Goal | Metric | Method |
|---|---|---|
| **Automatic routing** | Policy engine returns correct chain in 100% of valid submissions. Zero manual routing. | QA test all 5 rules + early flag in demo. |
| **Audit log completeness** | Every action (submission, each approval/denial, signoff, closure) has timestamp and named actor. | Manual audit of test cases in demo. |
| **90% same-day close** | 90% of cases move from submission to dAdmin final signoff in <24 hours. | Production data only. External dependency: approver responsiveness. Not measurable in demo. |
| **Chargeback readiness** | Tool sustains multi-user load during peak. 3-6 months clean operation before enforcement applied. | Production rollout KPI. |
| **Admin efficiency** | dAdmins self-report <10 minutes/day in tool. High volume periods logged separately. | Time-on-task diary study with dAdmins in production. |
| **Requestor submission time** | Full submission flow completed in <5 minutes on average. | Moderated usability test with representative users. |
| **Approver decision time** | Full case review and decision in <5 minutes from single screen. | Moderated usability test with representative approvers. |

> **As-built note:** "Requestor submission time" is the one metric in this table that has actually been measured (S-R5, moderated usability test against the live build) — confirmed under 5 minutes. The remaining metrics are either production-only (90% same-day close, chargeback readiness, admin efficiency) or not yet run as formal usability tests in the demo (approver decision time), and remain aspirational targets for the as-built system rather than verified results.

---

## 09 / Technical Assumptions

- Employee identity keyed to `eID`. At login, eID resolves staff type, role, and module assignments.
- A user can hold multiple roles (e.g. requestor + approver), but never for the same case. Landing page surfaces available actions based on active roles.
- Policy matrix preloaded as seed data. Not configurable via UI in demo.
- Module delivery dates are a field on the module record. Used by policy engine to calculate early flag at submission time.
- ~~Notification delivery mocked as in-app inbox in demo.~~ Notification delivery represented as audit log `notification_sent` events. Production target: Microsoft Teams.
- No real SSO. Demo uses eID selector tied to seeded user table.
- Employee directory mocked via seed data. Production would hook into Tableau or equivalent HR database via eID as primary key.
- **(New) Case and event state is in-memory only** (React context, no localStorage/sessionStorage/database). This is a **deliberate choice**, not a placeholder: each recruiter gets a clean, isolated session with no stale data from prior runs and no cross-session conflicts. A full page refresh resets all case state — this is documented as a known limitation in the demo README, not hidden. The context layer is the intended interface boundary for swapping in a real database in production; consuming components would require no changes.
- **(New) Submission timestamps use client-side `new Date()`.** Flagged as a "clock trust" limitation from PE-01 — acceptable for a single-user demo session, would need server-side timestamping in production to prevent client clock manipulation from affecting the early-flag calculation or audit log ordering.

---

## 10 / Demo Seed Data Plan

### Testable Flows

Four flows plus one rejection. Together they exercise the full rule set surface area.

1. **Consultant + Module A + Business** — full chain: PM → Principal → Partner → Practice Head → dAdmin
2. **Support + Module A + Business** — full chain: Line Manager → Dept Leader → Regional COO → dAdmin
3. **Support + Module A + Personal** — short chain: Line Manager → Talent Manager → dAdmin
4. **Any + Module B + Early flag** — dAdmin only (bypass all)
5. **Mid-chain rejection** — approver denies partway through → case returns to requestor with decision log

### Documented but Not Demo-Tested
- Consultant + Personal
- Consultant + Module B (no early flag)
- Support + Module B (no early flag)

### Seed Data Needs
- ~8-10 user identities across staff types and approver roles
- 3-4 modules (mix of type A and B, artificial delivery dates)
- At least one Module B with delivery date >4 weeks out (triggers early flag)
- dAdmin assigned to each module
- README with login instructions and suggested test flows

> **As-built note:** Seed data shipped larger than originally scoped — 141 employees across 3 practices (Banking, Transportation, Restructuring), 3 support depts (Marketing, Human Capital, Design), Admin, and Region Ops, plus 4 modules and 3 projects, generated via `generateSeed.mjs`. The jump from "~8-10 identities" to 141 was a deliberate choice to get a realistic management-chain walk (PE-02b resolves chains by walking real `line_manager_id` pointers, not hardcoded role lookups) — a thin seed set would have made chain resolution trivially correct without actually testing the traversal logic. One module (MOD-003) has its delivery date manually set to 2026-08-15 to guarantee a clear early-flag margin. Two parking-lot items from seed data design: talent manager assignment is only wired at the Consultant level (PM and above have null TM, noted for production), and senior-consultant/partner-opt-out routing remains out of scope as originally specified. The README itself remains a parked item — deferred until all flow cards ship (now effectively ready to write).

---

## 11 / Build Stack

~~Stack not yet decided. Decision criteria: what the product needs, not what's familiar. Evaluated against:~~

~~- Auth simplicity (eID selector, no SSO)~~
~~- Routing logic complexity (policy engine must be clean and testable)~~
~~- Notification mockup capability~~
~~- Recruiter accessibility (runs in browser, no setup required)~~
~~- PM portfolio context (common enough that hiring panels recognize it)~~

> ~~**Resume point**~~
> ~~Stack decision → build kickoff. All scoping decisions above are locked.~~

### Resolved (2026-05)

| Decision | Choice | Rationale |
|---|---|---|
| Hosting | Replit | Velocity over credibility optics. This is a portfolio proof of concept, not production. Public URL works for non-technical recruiters with zero setup. Shell access confirmed, Node v20 available. |
| Frontend framework | React via Vite | Industry standard, hiring-panel recognition, clean for a browser-only app. Next.js was considered and rejected — its routing/SSR complexity adds nothing for a client-only demo. |
| Logic layer | Browser-side only, no backend | Policy engine runs entirely in JS on the client. Keeps the architecture simple and inspectable for a demo — there's no server to stand up, deploy, or explain. |
| Local dev / coding assistant | Claude Code in VS Code, local machine | All code changes are written locally via Claude Code in VS Code, then pushed to GitHub. Replit pulls from GitHub rather than being the primary editing environment — Replit's role is hosting and execution, not authoring. |
| Seed data format | JSON files | Relational structure between users, modules, roles, and delivery dates, hand-authored and machine-generated via `generateSeed.mjs`. Designed to swap cleanly for a real database in production — see Section 9. |
| Portfolio structure | Single URL, demo embedded in the portfolio site | One codebase, one deployment. A recruiter gets a seamless end-to-end experience without switching contexts or links. |
| Version control | GitHub (private repo) as source of truth — local push via SSH, Replit pulls via a scoped access token stored as an encrypted secret | Standard split: a long-lived SSH key on the local machine handles push access and never leaves the machine; Replit holds a separate, rotatable, repo-scoped credential stored as an encrypted environment secret (never hardcoded into the remote URL) for pulling the latest code to run. |

Each criterion from the original evaluation list maps cleanly onto a resolved decision: auth simplicity → eID selector built directly against seed data (Section 9); routing logic complexity → the policy engine split discussed in Section 12; notification mockup capability → resolved by *not* mocking a channel at all (Section 6); recruiter accessibility → Replit's public URL; PM portfolio context → React + Vite is exactly the stack a hiring panel expects to see.

> **Resume point (updated):** Build stack is locked and has been in active use since SETUP-01. Core demo flows (requestor, approver, dAdmin) are shipped end-to-end. Remaining work is the portfolio site shell (PS-01–PS-05) that will host this PRD, production notes, and process artifacts.

---

## 12 / Build Evolution Log

This section is new in v1.0. It exists because a PRD that says "5 rules, 3 personas, 1 inbox" and a working demo that has 8 requestor stories, a split policy engine, and no inbox are technically the same product — but only if you can see *why* they diverged. The items below are the build-time decisions that meaningfully changed the shape of the product from what was originally scoped. Each one was a real tradeoff made under real constraints, not a correction of an error.

### Notification inbox killed (NI-01 → Won't Do)

**What changed:** The "in-app notification inbox (mock email)" listed as in-scope MVP (Section 6, original) was removed entirely and replaced with `notification_sent` system events written to the audit log at every routing step.

**Why:** Two distinct risks, both about what a recruiter *infers* from the artifact, not about engineering effort. First, **theater risk** — an inbox that obviously isn't a real inbox reads as "this person knows how to fake a feature," which undercuts trust in the parts of the demo that *are* real (the routing logic, the audit trail). Second, **confusion risk** — during a seeded walkthrough, a separate inbox screen looks like its own product surface with its own purpose, competing for attention with the actual point of the demo, which is that routing happens automatically and is auditable. The replacement — a system-authored audit log entry naming the recipient, their role, and a "Production: Microsoft Teams" callout — tells the same story (a notification *would* fire, *to this person*) without asking the viewer to suspend disbelief about a fake mailbox.

**What this enabled downstream:** Once "notification" was reframed as "an audit log entry, not a UI surface," several other stories simplified. S-A1 stopped being about a notification *link* and became about a dashboard *tile* (S-A1a/S-A1b) — which is arguably closer to how a real approver would actually experience "I have something to do" (a badge in their tool of record, not an email). AL-02 (standalone audit log display) was killed for the same reason — once notifications were just audit events, a standalone "audit log screen" was redundant with each persona's dashboard already needing to show *some* event history.

### Audit log display redistributed (AL-02 → Won't Do)

**What changed:** AL-02, a standalone card for audit-log display on case views, was killed and its responsibility distributed across each persona's existing dashboard:
- Requestor dashboard (S-R4/S-R7): name, role, timestamp, event type, reasoning. No eIDs. System notification events show the Teams callout.
- Approver case view (S-A2): same display rules as requestor, plus prior approver reasoning is visible — this is the anti-rubber-stamping mechanism (Decision #16).
- dAdmin case view (S-D2): full log including eIDs — the only view where eIDs render.

**Why:** A standalone audit log view assumes the audit log is a destination. In practice, every persona's dashboard *already* needs to show case history to do its job — the requestor needs it to prove they're not the blocker (persona failure mode), the approver needs prior reasoning to avoid rubber-stamping, and the dAdmin needs the full picture including identities for accountability. Building a fourth, separate view would have meant either duplicating that data three times or making every persona detour through a generic screen that wasn't tailored to what they actually needed to see. The eID display rule (eIDs only in the dAdmin view) became a single locked policy enforced at one component boundary (`CaseHistory`, with a `showEid` prop) rather than three different screens each needing to remember the rule independently.

### Policy engine split: PE-02 → PE-02a + PE-02b

**What changed:** The original PE-02 card ("policy engine: rule selection + chain resolution") was a single M-sized ticket. It was split into PE-02a (`selectRule` — pure function, staff/module/case type + early flag → rule number) and PE-02b (`resolveApproverData` + `resolveChain` — walks the org hierarchy to produce named approvers).

**Why:** The original card bundled two genuinely different kinds of logic under one acceptance criterion. Rule selection is pure — four inputs, one of five outputs, no dependencies, trivially unit-testable. Chain resolution requires reading the seed data, walking a `line_manager_id` chain upward with a cycle guard, resolving a talent manager pointer, and handling coverage gaps. Shipping these as one card meant either testing them together (so a chain-resolution bug could mask whether rule selection was even correct) or writing test scaffolding that artificially separated them anyway. Splitting made each piece independently verifiable — PE-02a shipped with 8/8 tests passing on pure rule logic before PE-02b touched a single file of seed data. This is the kind of split that's obvious in retrospect and easy to miss when a card is being scoped from a policy table rather than from the data dependencies underneath it.

### Approver flow restructure: S-A1 → S-A1a/S-A1b; S-A2/S-A3 → merged S-A2; S-A4 → S-A3

**What changed:** The original four-story approver flow (S-A1–S-A4) was rebuilt into three shipped units:
- **S-A1a** — pulse animation + pending-case counter on the APPROVER role-dashboard tile
- **S-A1b** — a dedicated pending-cases dashboard (table of cases awaiting the approver's decision)
- **S-A2** — the merged case-detail-and-decision screen (originally separate S-A2 "see context" and S-A3 "decide")
- **S-A3** — auto-routing after decision (originally S-A4, renumbered only)

**Why:** This restructure happened in two passes. First, killing the notification inbox (above) meant S-A1's "notification with a link" needed a new home — it became a tile (the *signal* that something needs attention) plus a list view (the *destination*). Splitting these into 1a/1b mirrored the natural UI boundary: a tile is a glanceable indicator, a dashboard is a worklist, and conflating them would have made the tile do too much. Second, once the case-detail screen for S-A2 was being built, it became obvious that "see full context" (original S-A2) and "decide with reasoning" (original S-A3) describe the *same screen* — there's no real product reason an approver would see context on one screen and decide on another. The split was an artifact of how the stories were originally written (one user goal per story), not a reflection of how the UI actually needs to be organized. Recognizing this kind of false split — and merging it back — is as much a part of good story-writing as splitting an oversized one.

### Role separation: dAdmin masterkey revisited

**What changed:** SETUP-03 originally specified "dAdmin is a masterkey role — all three tiles (REQUESTOR, APPROVER, DEPT ADMIN) activate for dAdmin employees," on the rationale that a dAdmin needs full system visibility for a demo walkthrough. Once both the approver and dAdmin flows existed, a bug surfaced: a dAdmin would see the *same* pending case pulse on both their APPROVER and DEPT ADMIN tiles, and could action a final-signoff case through the approver screen — which has the wrong character minimum (100 vs. 200), doesn't show eIDs, and doesn't write the structured signoff event.

**The fix (three-part):**
1. **Role dashboard** — pending cases are split into two buckets by the role label at the case's current chain position: `pendingAsApprover` (the dAdmin is an intermediate approver — e.g. standing in for a coverage gap) vs. `pendingAsDAdmin` (the dAdmin is the final-signoff slot). Both tiles can pulse independently and simultaneously for the same person on different cases.
2. **Approver dashboard** — explicitly excludes any case where the current chain entry's role is "Dept Admin." Final-signoff cases never appear in the approver queue at all.
3. **Approver case view** — defensively redirects to the dAdmin case detail view if a dAdmin somehow lands on a final-signoff case through the approver path (covers direct URL navigation).

**Why this matters for the PRD:** This is a case where a reasonable simplifying assumption ("dAdmin sees everything") was correct at the *persona* level but wrong at the *interaction* level once two flows that both reference "dAdmin" were built side by side. The fix didn't change who a dAdmin *is* — it recognized that a single person can occupy two different roles *on different cases at the same time*, and the UI needed to reflect that distinction structurally rather than relying on the user to know which screen to use. See the as-built note on the dAdmin persona card in Section 3.

### Fallback rule: unresolvable chain slot routes to dAdmin

**What changed:** During chain resolution (PE-02b), if any role in the resolved approver chain can't be matched to a real person — most commonly a null `talent_manager_id`, but the same logic covers any broken or missing pointer in the management chain — that slot is filled by the dAdmin instead of the chain resolution simply failing or producing a gap. The substituted entry is flagged `isStandIn: true` and surfaces to the requestor as a "STAND-IN" badge on their approver-chain view (Decision #12, Section 7).

**Why:** This was framed early as "coverage gap" handling — what happens if someone's on leave or a role is vacant — but its real significance is broader: it's a **redundancy guarantee for the routing engine itself**. A policy-driven, data-resolved chain (Decision: configurable rules, Section 5) is only as reliable as the org data it walks. Org data will have gaps — vacant roles, broken reporting lines, employees who left without a backfill recorded yet. Rather than letting a gap become a dead end (a case nobody can act on, with no recipient at all), the system guarantees that **every chain always resolves to someone** by falling back to the dAdmin, who is already the chain's terminal authority and therefore an appropriate escalation point regardless of which intermediate role went missing.

**Why this is forward-looking, not just a demo patch:** As the policy matrix becomes genuinely configurable (Section 5's framing note — new rules, new roles, new chains as data changes rather than code changes), the *number of ways a chain can fail to resolve* grows with it. A new role added to a chain might not have its reporting-line data fully populated yet; a newly-onboarded department might have gaps in its org hierarchy during a transition period. The dAdmin-fallback rule means the routing engine degrades gracefully under all of these conditions without needing a corresponding "what if this specific new role is missing" rule to be written for every possible configuration. It's a single, general guarantee — *the chain always terminates in a real, accountable person* — that holds regardless of how the rest of the policy matrix evolves. This is the kind of property that's cheap to build in from the start and expensive to retrofit once a configurable system has many rule variants in production.

### New stories not in the original scope: S-R7, S-R8

**What changed:** Two requestor-side stories were added that don't map to any story in the original PRD:
- **S-R7** — Past Cases section on the requestor dashboard, splitting active (`pending`) from terminal (`fully_approved` / `denied`) cases, each with its own role-filtered audit log.
- **S-R8** — A read/unread pulse mechanism: the REQUESTOR tile pulses with a "N DECISIONS TO REVIEW" counter when closed cases haven't been viewed yet, and individual past-case rows carry their own pulse until expanded.

**Why these emerged:** Both are downstream consequences of cases being able to actually *reach* a terminal state, which only became true once S-A3 (auto-routing) and S-D6 (dAdmin signoff wire-up) shipped. Before that point, "case status" was a single always-pending state and a flat list was sufficient. Once cases could close, an undifferentiated list became both a usability problem (a requestor with several closed cases couldn't easily find their open one) and a missed opportunity — S-R6's acceptance criterion ("receive a notification with the final decision") had originally been satisfied passively (the dashboard *would* show the new status if you looked), but S-R8 makes it active: the system tells you to look. S-R7's structure directly mirrors S-D5's active/past split on the dAdmin side, which shipped first — once that pattern existed and worked, applying it to the requestor dashboard was a small, well-understood addition rather than a new design problem.

### Persistence: in-memory by design, not by default

**What changed:** Nothing — but it's worth stating explicitly because "no database" can read as an unfinished corner if left unexplained. Case and event state lives entirely in React context, reset on full page refresh.

**Why this is a decision, not a gap:** Each recruiter or reviewer running the demo gets a clean, isolated session — no risk of seeing stale data from someone else's run, no risk of two concurrent viewers stepping on each other's state. In-memory state survives persona switches via client-side navigation (the core demo loop — switch from requestor to approver to dAdmin without losing the case you just created), which is the property that actually matters for a walkthrough. The known limitation (full refresh = reset) is documented in the demo README rather than hidden, and the context layer is structured as the seam where a real database would plug in for production — consuming components wouldn't need to change. This is documented in Section 9 as a technical assumption rather than buried in a commit message, because it's a legitimate architectural choice with a clear migration path, not a TODO.

---

*Resume point: Portfolio site (PS-01 → PS-05) — kanban screenshots, stack decision log, and process artifacts to be assembled per the Build Tracker. This PRD section (12) and the Tradeoffs & Retro page are deliberately scoped as separate documents: this section is the in-line "what changed and why" for someone reading the PRD top to bottom; the Tradeoffs & Retro page is a standalone reflection piece. Reconciling cross-links between the two is out of scope for this revision.*
