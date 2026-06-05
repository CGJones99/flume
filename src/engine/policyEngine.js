import employees from '../data/employees.json' with { type: 'json' };
import modules from '../data/modules.json' with { type: 'json' };

// ---------------------------------------------------------------------------
// selectRule
// ---------------------------------------------------------------------------

/**
 * Maps case inputs to a policy rule number (1–5).
 * earlyFlag true + moduleType B short-circuits to rule 5 regardless of
 * staffType or caseType — matching the bypass row in the policy matrix.
 *
 * @param {string}       staffType   "Consultant" | "Support"
 * @param {string}       moduleType  "A" | "B"
 * @param {string}       caseType    "Business" | "Personal"
 * @param {boolean|null} earlyFlag   true | false | null (null = type A module)
 * @returns {number} 1–5
 */
export function selectRule(staffType, moduleType, caseType, earlyFlag) {
  if (earlyFlag === true && moduleType === 'B') return 5;

  if (staffType === 'Consultant' && caseType === 'Business') return 1;
  if (staffType === 'Consultant' && caseType === 'Personal')  return 2;
  if (staffType === 'Support'    && caseType === 'Business') return 3;
  if (staffType === 'Support'    && caseType === 'Personal')  return 4;

  throw new Error(
    `selectRule: invalid input — staffType="${staffType}", moduleType="${moduleType}", caseType="${caseType}", earlyFlag=${earlyFlag}`
  );
}

// ---------------------------------------------------------------------------
// resolveApproverData
// ---------------------------------------------------------------------------

/**
 * Data access layer for chain resolution.
 * Walks the requestor's management chain upward via line_manager_id and
 * resolves their talent manager and the module's dAdmin.
 * No raw employee records leave this function.
 *
 * @param {string} requestorId  employee_id of the requestor
 * @param {string} moduleId     module_id of the submitted case
 * @returns {{
 *   staffType: string,
 *   managementChain: Array<{fullName: string, roleLabel: string}>,
 *   talentManager: {fullName: string, roleLabel: string} | null,
 *   dAdmin: {fullName: string, roleLabel: string}
 * }}
 */
export function resolveApproverData(requestorId, moduleId) {
  const empMap = new Map(employees.map(e => [e.employee_id, e]));

  const requestor = empMap.get(requestorId);
  if (!requestor) throw new Error(`resolveApproverData: requestor not found — ${requestorId}`);

  const module = modules.find(m => m.module_id === moduleId);
  if (!module) throw new Error(`resolveApproverData: module not found — ${moduleId}`);

  // Walk line_manager_id upward; stop at the top of the org or on a cycle
  const managementChain = [];
  const visited = new Set([requestorId]);
  let currentId = requestor.line_manager_id;
  while (currentId) {
    if (visited.has(currentId)) break;
    visited.add(currentId);
    const emp = empMap.get(currentId);
    if (!emp) break;
    managementChain.push({ fullName: emp.name, roleLabel: emp.role });
    currentId = emp.line_manager_id;
  }

  // Talent Manager — may be null for senior roles (PM and above have no TM in seed data)
  const tmEmp = requestor.talent_manager_id ? empMap.get(requestor.talent_manager_id) : null;
  const talentManager = tmEmp ? { fullName: tmEmp.name, roleLabel: tmEmp.role } : null;

  // dAdmin from the module record
  const dAdminEmp = empMap.get(module.dadmin_id);
  if (!dAdminEmp) throw new Error(`resolveApproverData: dAdmin not found — ${module.dadmin_id}`);
  const dAdmin = { fullName: dAdminEmp.name, roleLabel: 'Dept Admin' };

  return { staffType: requestor.staff_type, managementChain, talentManager, dAdmin };
}

// ---------------------------------------------------------------------------
// resolveChain
// ---------------------------------------------------------------------------

/**
 * Builds the ordered approver chain for a given rule number.
 * Uses the output of resolveApproverData — no direct data access here.
 *
 * Coverage gap rule: if a required chain position cannot be resolved
 * (managementChain is shorter than the rule needs, or talentManager is null),
 * dAdmin stands in for that position with isStandIn: true.
 * dAdmin always appears as the final entry. If dAdmin stands in earlier,
 * both entries are included — they represent distinct decision steps.
 *
 * Employee IDs do not appear in the output.
 *
 * @param {number} ruleNumber   1–5
 * @param {{
 *   managementChain: Array<{fullName: string, roleLabel: string}>,
 *   talentManager: {fullName: string, roleLabel: string} | null,
 *   dAdmin: {fullName: string, roleLabel: string}
 * }} resolverData  Output of resolveApproverData
 * @returns {Array<{fullName: string, roleLabel: string, isStandIn: boolean}>}
 */
export function resolveChain(ruleNumber, resolverData) {
  const { managementChain, talentManager, dAdmin } = resolverData;

  // Pulls a chain position by index; substitutes dAdmin if the slot is empty
  function slot(index) {
    const entry = managementChain[index];
    return entry
      ? { fullName: entry.fullName, roleLabel: entry.roleLabel, isStandIn: false }
      : { fullName: dAdmin.fullName, roleLabel: dAdmin.roleLabel, isStandIn: true };
  }

  function tmSlot() {
    return talentManager
      ? { fullName: talentManager.fullName, roleLabel: talentManager.roleLabel, isStandIn: false }
      : { fullName: dAdmin.fullName, roleLabel: dAdmin.roleLabel, isStandIn: true };
  }

  const dAdminFinal = { fullName: dAdmin.fullName, roleLabel: dAdmin.roleLabel, isStandIn: false };

  switch (ruleNumber) {
    case 1: // Consultant + Business: PM → Principal → Partner → Practice Head → dAdmin
      return [slot(0), slot(1), slot(2), slot(3), dAdminFinal];

    case 2: // Consultant + Personal: PM → Talent Manager → dAdmin
      return [slot(0), tmSlot(), dAdminFinal];

    case 3: // Support + Business: Line Manager → Dept Leader → Regional COO → dAdmin
      return [slot(0), slot(1), slot(2), dAdminFinal];

    case 4: // Support + Personal: Line Manager → Talent Manager → dAdmin
      return [slot(0), tmSlot(), dAdminFinal];

    case 5: // Early flag bypass: dAdmin only
      return [dAdminFinal];

    default:
      throw new Error(`resolveChain: unknown rule number — ${ruleNumber}`);
  }
}

// ---------------------------------------------------------------------------
// TEST BLOCK — remove before wiring to submission flow
// Run: node src/engine/policyEngine.js
// ---------------------------------------------------------------------------
function runPE02bTests() {
  console.log('=== PE-02b: resolveApproverData + resolveChain ===\n');

  // Rule 1 — Consultant + Business
  // EMP-0013 Robin Adler (Consultant, Banking) + MOD-001 (type A, Consultant)
  // Expected chain: Blake Beck (PM) → Jordan Marsh (Principal) → Parker Nash (Partner) → Nico Uddin (Practice Head) → Alex Gibbs (dAdmin)
  console.log('--- Rule 1: Consultant + Business ---');
  const data1 = resolveApproverData('EMP-0013', 'MOD-001');
  const chain1 = resolveChain(1, data1);
  console.log(JSON.stringify(chain1, null, 2));

  // Rule 2 — Consultant + Personal
  // Same requestor + module; TM is Blake Abbott (EMP-0003)
  console.log('\n--- Rule 2: Consultant + Personal ---');
  const data2 = resolveApproverData('EMP-0013', 'MOD-001');
  const chain2 = resolveChain(2, data2);
  console.log(JSON.stringify(chain2, null, 2));

  // Rule 3 — Support + Business
  // EMP-0067 Nico Xu (Support Staff, Marketing) + MOD-002 (type A, Support)
  // Expected chain: Gray Torres (Line Manager) → Peyton Hayes (Dept Leader) → Elliot James (Regional COO) → Tatum Hunt (dAdmin)
  console.log('\n--- Rule 3: Support + Business ---');
  const data3 = resolveApproverData('EMP-0067', 'MOD-002');
  const chain3 = resolveChain(3, data3);
  console.log(JSON.stringify(chain3, null, 2));

  // Rule 4 — Support + Personal
  // Same requestor + module; TM is Peyton Moon (EMP-0063)
  console.log('\n--- Rule 4: Support + Personal ---');
  const data4 = resolveApproverData('EMP-0067', 'MOD-002');
  const chain4 = resolveChain(4, data4);
  console.log(JSON.stringify(chain4, null, 2));

  // Rule 5 — Early flag bypass
  // EMP-0013 + MOD-003 (type B, delivery 2026-08-15, triggers early flag)
  // Expected: Casey Park (dAdmin only)
  console.log('\n--- Rule 5: Early flag bypass ---');
  const data5 = resolveApproverData('EMP-0013', 'MOD-003');
  const chain5 = resolveChain(5, data5);
  console.log(JSON.stringify(chain5, null, 2));

  // Coverage gap — talentManager null, rule 2
  // Simulates a requestor with no TM assigned (PM-level employee used as requestor edge case).
  // resolveChain called directly with a fabricated resolverData to isolate the gap logic.
  console.log('\n--- Coverage gap: talentManager null, rule 2 (dAdmin stands in) ---');
  const gapData = {
    staffType: 'Consultant',
    managementChain: [{ fullName: 'Blake Beck', roleLabel: 'PM' }],
    talentManager: null,
    dAdmin: { fullName: 'Alex Gibbs', roleLabel: 'Dept Admin' },
  };
  const chainGap = resolveChain(2, gapData);
  console.log(JSON.stringify(chainGap, null, 2));
}

runPE02bTests();
// ---------------------------------------------------------------------------
