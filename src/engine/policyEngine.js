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
 * @param {string}       staffType   "Field" | "Office"
 * @param {string}       moduleType  "A" | "B"
 * @param {string}       caseType    "Business" | "Personal"
 * @param {boolean|null} earlyFlag   true | false | null (null = type A module)
 * @returns {number} 1–5
 */
export function selectRule(staffType, moduleType, caseType, earlyFlag) {
  if (earlyFlag === true && moduleType === 'B') return 5;

  if (staffType === 'Field'  && caseType === 'Business') return 1;
  if (staffType === 'Field'  && caseType === 'Personal')  return 2;
  if (staffType === 'Office' && caseType === 'Business') return 3;
  if (staffType === 'Office' && caseType === 'Personal')  return 4;

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
 *   managementChain: Array<{fullName: string, roleLabel: string, eID: string}>,
 *   hrRep: {fullName: string, roleLabel: string, eID: string} | null,
 *   dAdmin: {fullName: string, roleLabel: string, eID: string}
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
    managementChain.push({ fullName: emp.name, roleLabel: emp.role, eID: emp.employee_id });
    currentId = emp.line_manager_id;
  }

  // HR Rep — may be null for dAdmin employees
  const tmEmp = requestor.hr_rep_id ? empMap.get(requestor.hr_rep_id) : null;
  const hrRep = tmEmp ? { fullName: tmEmp.name, roleLabel: tmEmp.role, eID: tmEmp.employee_id } : null;

  // dAdmin from the module record
  const dAdminEmp = empMap.get(module.dadmin_id);
  if (!dAdminEmp) throw new Error(`resolveApproverData: dAdmin not found — ${module.dadmin_id}`);
  const dAdmin = { fullName: dAdminEmp.name, roleLabel: 'Dept Admin', eID: dAdminEmp.employee_id };

  return { staffType: requestor.staff_type, managementChain, hrRep, dAdmin };
}

// ---------------------------------------------------------------------------
// resolveChain
// ---------------------------------------------------------------------------

/**
 * Builds the ordered approver chain for a given rule number.
 * Uses the output of resolveApproverData — no direct data access here.
 *
 * Coverage gap rule: if a required chain position cannot be resolved
 * (managementChain is shorter than the rule needs, or hrRep is null),
 * dAdmin stands in for that position with isStandIn: true.
 * dAdmin always appears as the final entry. If dAdmin stands in earlier,
 * both entries are included — they represent distinct decision steps.
 *
 * @param {number} ruleNumber   1–5
 * @param {{
 *   managementChain: Array<{fullName: string, roleLabel: string, eID: string}>,
 *   hrRep: {fullName: string, roleLabel: string, eID: string} | null,
 *   dAdmin: {fullName: string, roleLabel: string, eID: string}
 * }} resolverData  Output of resolveApproverData
 * @returns {Array<{fullName: string, roleLabel: string, eID: string, isStandIn: boolean}>}
 */
export function resolveChain(ruleNumber, resolverData) {
  const { managementChain, hrRep, dAdmin } = resolverData;

  // Pulls a chain position by index; substitutes dAdmin if the slot is empty
  function slot(index) {
    const entry = managementChain[index];
    return entry
      ? { fullName: entry.fullName, roleLabel: entry.roleLabel, eID: entry.eID, isStandIn: false }
      : { fullName: dAdmin.fullName, roleLabel: dAdmin.roleLabel, eID: dAdmin.eID, isStandIn: true };
  }

  function tmSlot() {
    return hrRep
      ? { fullName: hrRep.fullName, roleLabel: hrRep.roleLabel, eID: hrRep.eID, isStandIn: false }
      : { fullName: dAdmin.fullName, roleLabel: dAdmin.roleLabel, eID: dAdmin.eID, isStandIn: true };
  }

  const dAdminFinal = { fullName: dAdmin.fullName, roleLabel: dAdmin.roleLabel, eID: dAdmin.eID, isStandIn: false };

  switch (ruleNumber) {
    case 1: // Field + Business: Team Lead → Senior Director → dAdmin
      return [slot(0), slot(1), dAdminFinal];

    case 2: // Field + Personal: Team Lead → HR Rep → dAdmin
      return [slot(0), tmSlot(), dAdminFinal];

    case 3: // Office + Business: Line Manager → Senior Manager → Department Head → dAdmin
      return [slot(0), slot(1), slot(2), dAdminFinal];

    case 4: // Office + Personal: Line Manager → HR Rep → dAdmin
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

  // Rule 1 — Field + Business
  // EMP-0006 (Junior Analyst, Account Management) + MOD-001 (type A, Field)
  // Expected chain: Team Lead → Senior Director → dAdmin
  console.log('--- Rule 1: Field + Business ---');
  const data1 = resolveApproverData('EMP-0006', 'MOD-001');
  const chain1 = resolveChain(1, data1);
  console.log(JSON.stringify(chain1, null, 2));

  // Rule 2 — Field + Personal
  // Same requestor + module; HR Rep is EMP-0002 (Account Management HR Rep)
  console.log('\n--- Rule 2: Field + Personal ---');
  const data2 = resolveApproverData('EMP-0006', 'MOD-001');
  const chain2 = resolveChain(2, data2);
  console.log(JSON.stringify(chain2, null, 2));

  // Rule 3 — Office + Business
  // EMP-0069 (IC, Finance) + MOD-011 (type A, Office)
  // Expected chain: Line Manager → Senior Manager → Department Head → dAdmin
  console.log('\n--- Rule 3: Office + Business ---');
  const data3 = resolveApproverData('EMP-0069', 'MOD-011');
  const chain3 = resolveChain(3, data3);
  console.log(JSON.stringify(chain3, null, 2));

  // Rule 4 — Office + Personal
  // Same requestor + module; HR Rep is EMP-0062 (Finance HR Rep)
  console.log('\n--- Rule 4: Office + Personal ---');
  const data4 = resolveApproverData('EMP-0069', 'MOD-011');
  const chain4 = resolveChain(4, data4);
  console.log(JSON.stringify(chain4, null, 2));

  // Rule 5 — Early flag bypass
  // EMP-0006 + MOD-006 (type B, deployment_date 2026-08-15, triggers early flag)
  // Expected: dAdmin only
  console.log('\n--- Rule 5: Early flag bypass ---');
  const data5 = resolveApproverData('EMP-0006', 'MOD-006');
  const chain5 = resolveChain(5, data5);
  console.log(JSON.stringify(chain5, null, 2));

  // Coverage gap — hrRep null, rule 2
  // Simulates a requestor with no HR Rep assigned (dAdmin used as requestor edge case).
  // resolveChain called directly with a fabricated resolverData to isolate the gap logic.
  console.log('\n--- Coverage gap: hrRep null, rule 2 (dAdmin stands in) ---');
  const gapData = {
    staffType: 'Field',
    managementChain: [{ fullName: 'Alex Adams', roleLabel: 'Team Lead' }],
    hrRep: null,
    dAdmin: { fullName: 'Blake Adams', roleLabel: 'Dept Admin' },
  };
  const chainGap = resolveChain(2, gapData);
  console.log(JSON.stringify(chainGap, null, 2));
}

runPE02bTests();
// ---------------------------------------------------------------------------
