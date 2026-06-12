# Flume

**Structured case management for resource-policy exceptions in cost-center departments.**
Auto-routed. Auditable. Every delay has a named responsible party.

[Live Demo](https://flume.replit.app) · [Portfolio Writeup](https://conorjones.dev/work/flume)

---

## What it does

A cost-center department's budget leaks because the process to request exceptions is run entirely through email, with no routing, no accountability, and no audit trail. Staff are discouraged from even trying to comply with policy. This demo implements one exception variant end to end: cancellation, releasing a committed resource to free budget.

Flume replaces that with a structured workflow: submit a case, the system resolves the correct approver chain from policy, routes it automatically, and timestamps every action. Leadership gets full visibility. Every delay has a name attached to it.

This is a portfolio demo artifact — no backend, no database, no SSO. All state is in-memory React context. Policy logic runs client-side against seed data.

---

## Critical: do not refresh

**All data lives in memory.** A page refresh hard-resets every case and approval. Open the app, run a full walkthrough in one session, and close when done. If you refresh mid-walkthrough, start over.

---

## How to navigate the demo

The app uses eID (employee ID) as the login credential. Type an eID into the login field — the system resolves your role from seed data and routes you to the correct dashboard.

To walk a full approval chain: complete one step, click **Sign Out** from the header, then sign in as the next approver in the chain. Cases persist in shared context across sign-outs as long as you do not refresh.

---

## The 5 routing rules

The policy engine selects a rule based on the requestor's staff type, the module type, and whether the early flag is set. The early flag is system-calculated from the module's deployment date at submission time — the requestor never sets it.

| # | Staff Type | Case Type | Module | Early Flag | Chain |
|---|-----------|-----------|--------|------------|-------|
| 1 | Field | Business | A or B | No | Team Lead → Senior Director → dAdmin |
| 2 | Field | Personal | A or B | No | Team Lead → HR Rep → dAdmin |
| 3 | Office | Business | A or B | No | Line Manager → Senior Manager → Department Head → dAdmin |
| 4 | Office | Personal | A or B | No | Line Manager → HR Rep → dAdmin |
| 5 | Any | Either | B only | **Yes** | dAdmin only (all intermediate approvers bypassed) |

**Early flag:** triggered when a Type B module's deployment date is 28 or more days from the submission date. High-lead-time commitments skip the chain and go straight to department oversight.

---

## Walkthroughs by rule

Each scenario tells you which eIDs to use and in what order. Sign out between each step and sign in as the next person in the chain.

---

### Rule 1 — Field + Business

**Submit:** Sign in as **EMP-0006** (Gray Kane, Field / Account Management). Navigate to module **MOD-001** (Alpha Intake Batch, Type A). Select case type **Business**. Write a reason (minimum 75 characters). Submit.

**Approver chain:**

| Step | eID | Name | Role |
|------|-----|------|------|
| 1 | EMP-0003 | Gray Evans | Team Lead |
| 2 | EMP-0001 | Gray Forde | Senior Director |
| Final | EMP-0135 | Jamie Dunn | Dept Admin |

---

### Rule 2 — Field + Personal

Same requestor and module as Rule 1. Personal cases route through HR instead of up the management chain.

**Submit:** Sign in as **EMP-0006** (Gray Kane). Navigate to **MOD-001**. Select case type **Personal**. Write a reason. Submit.

**Approver chain:**

| Step | eID | Name | Role |
|------|-----|------|------|
| 1 | EMP-0003 | Gray Evans | Team Lead |
| 2 | EMP-0002 | Kai James | HR Rep |
| Final | EMP-0135 | Jamie Dunn | Dept Admin |

---

### Rule 3 — Office + Business

Office staff have a deeper hierarchy. Business cases traverse three management levels before reaching dAdmin.

**Submit:** Sign in as **EMP-0069** (Logan Jones, Office / Finance). Navigate to **MOD-011** (Office Support Batch, Type A). Select case type **Business**. Write a reason. Submit.

**Approver chain:**

| Step | eID | Name | Role |
|------|-----|------|------|
| 1 | EMP-0065 | Robin Hall | Line Manager |
| 2 | EMP-0063 | Hayden Hill | Senior Manager |
| 3 | EMP-0061 | Logan Cooper | Department Head |
| Final | EMP-0135 | Jamie Dunn | Dept Admin |

---

### Rule 4 — Office + Personal

Same requestor and module as Rule 3. Personal cases again short-circuit to HR, skipping the middle management levels.

**Submit:** Sign in as **EMP-0069** (Logan Jones). Navigate to **MOD-011**. Select case type **Personal**. Write a reason. Submit.

**Approver chain:**

| Step | eID | Name | Role |
|------|-----|------|------|
| 1 | EMP-0065 | Robin Hall | Line Manager |
| 2 | EMP-0062 | Peyton Cruz | HR Rep |
| Final | EMP-0135 | Jamie Dunn | Dept Admin |

---

### Rule 5 — Early flag bypass

When a Type B module's deployment is 28+ days away, the system flags it at submission and bypasses every intermediate approver. The case lands directly with dAdmin.

**Submit:** Sign in as **EMP-0006** (Gray Kane). Navigate to **MOD-006** (Extended Field Rotation, Type B, deploys 2026-08-15). Select either case type. Write a reason. Submit.

The system calculates the early flag automatically from the deployment date. You will see **EARLY FLAG: YES — RULE 5 APPLIED** on the case detail. No mid-chain approvers appear.

**Approver chain:**

| Step | eID | Name | Role |
|------|-----|------|------|
| Final (only step) | EMP-0140 | Jordan Park | Dept Admin |

To see a Type B module *without* the early flag, use **MOD-008** (Field Reserve Pool, Type B, deploys 2026-06-25) — close enough to today that the flag does not fire. Rules 1 or 2 will apply based on case type, and the full chain runs normally.

---

## Behaviors worth noting

### Mid-chain approver decisions

Each approver in the chain (steps 1–3 in Rules 1–4) sees an approve/deny toggle and a required reasoning field. **Minimum 100 characters.** The character floor enforces that approvers document their reasoning before the case advances — rubber-stamping is not a valid action.

### dAdmin final signoff

dAdmin approval requires two steps beyond the toggle:

1. **Approval path** — select from Policy Satisfied, Expedited, or Special Case. This is the classification that would be entered into a downstream allocations system in production.
2. **Allocation system checkbox** — confirm that the cancellation has been processed in the allocation system. In a real deployment this is the action that actually releases the budget commitment. The checkbox represents the handoff between the approval workflow and whatever downstream system owns the commitment record.

These fields exist because clicking Approve without taking the downstream action is a common point of process failure in manual workflows. The UI enforces that both happen together.

### dAdmin denial threshold

dAdmin denial requires **200 characters minimum** — twice the floor for mid-chain approvers. By the time a case reaches dAdmin it has already been reviewed at every other level. Overturning that consensus is a significant decision and needs a documented, defensible reason. A brief denial at this stage would undermine the full chain of decisions that preceded it.

### Denial terminates the chain

A denial at any step immediately closes the case. There is no escalation path and no appeals flow. The case is marked denied, the requestor is notified (in-app mock inbox), and no further actions are possible on that case.

### Early flag is not surfaced to the requestor

The early flag is calculated silently at submission and displayed only on the case detail view for approvers and dAdmin. Requestors do not see it and cannot influence it. This is intentional — routing logic should not be gameable by timing submissions.

### Admins are supervisory only — they cannot raise cases

dAdmin employees carry the staff type `admin` and are not assigned to any module. In this model the department admin is purely a supervisory/process role: they sit at the end of every approval chain and own module oversight, but they do not consume modules and therefore have no exception to raise against one. Because of that, the **Submit and Track Cancellation Requests** tile is hidden on the role-select screen when you sign in as a dAdmin — only the approver and admin tiles appear. (Every other approver role — Team Lead, Senior Director, Line Manager, and so on — keeps a Field or Office staff type, so those people *can* act as requestors as well as approve.) This is a deliberate boundary, not a missing feature: if a future revision wanted admins to participate as requestors, it would simply give them a Field or Office staff type.

---

## Seed data reference

| Entity | Count | Notes |
|--------|-------|-------|
| Employees | 141 | Field and Office staff across org units; 10 dedicated dAdmin employees (staff type `admin`, supervisory only — cannot raise cases) |
| Modules | 20 | Type A and B; Field and Office variants |
| Cases | 0 seeded | Created at runtime — reset on refresh |

**Modules used in walkthroughs:**

| Module | Name | Type | Staff | Deploys | Early flag? |
|--------|------|------|-------|---------|------------|
| MOD-001 | Alpha Intake Batch | A | Field | 2026-07-15 | N/A |
| MOD-006 | Extended Field Rotation | B | Field | 2026-08-15 | **Yes** |
| MOD-007 | Long-Cycle Assignment | B | Field | 2026-07-10 | Yes |
| MOD-008 | Field Reserve Pool | B | Field | 2026-06-25 | No |
| MOD-011 | Office Support Batch | A | Office | 2026-07-20 | N/A |
| MOD-016 | Extended Office Rotation | B | Office | 2026-08-20 | **Yes** |

---

## Stack

- React 19 + Vite 8, browser-only
- React Router v7
- No backend, no database, no SSO
- Policy engine: plain JS, runs client-side against `src/data/`
- Fonts: Departure Mono, Geist, JetBrains Mono (CDN)
- Hosted on Replit

---

## Running locally

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`.
