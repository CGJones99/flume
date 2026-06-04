/**
 * Flume — Seed Data Generator
 * Outputs: employees.json, modules.json, projects.json
 *
 * Run with: node generateSeed.mjs
 * Output files land in ./src/data/
 */

import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

// ─── CONFIG ──────────────────────────────────────────────────────────────────

const REGION = "Americas";
const OUTPUT_DIR = "./src/data";

const PRACTICES = ["Banking", "Transportation", "Restructuring"];
const SUPPORT_DEPTS = ["Marketing", "Human Capital", "Design"];

const PRACTICE_SHAPE = {
  "Practice Head": 1,
  "Talent Manager": 1,
  "Partner": 2,
  "Principal": 3,
  "PM": 4,
  "Consultant": 9,
};

const SUPPORT_SHAPE = {
  "Dept Leader": 1,
  "Talent Manager": 1,
  "Line Manager": 3,
  "Support Staff": 15,
};

const MODULE_DEFINITIONS = [
  {
    module_id: "MOD-001",
    module_name: "Q3 Analyst Allocation",
    module_type: "A",
    delivery_date: "2026-07-15",
    allowed_staff_type: "Consultant",
    cancellation_unit_value: 4500,
  },
  {
    module_id: "MOD-002",
    module_name: "Americas Support Bench",
    module_type: "A",
    delivery_date: "2026-08-01",
    allowed_staff_type: "Support",
    cancellation_unit_value: 2800,
  },
  {
    module_id: "MOD-003",
    module_name: "H2 Flex Pool",
    module_type: "B",
    delivery_date: "2026-07-10",
    allowed_staff_type: "Consultant",
    cancellation_unit_value: 6200,
  },
  {
    module_id: "MOD-004",
    module_name: "Ops Surge Capacity",
    module_type: "B",
    delivery_date: "2026-06-20",
    allowed_staff_type: "Support",
    cancellation_unit_value: 3100,
  },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────

let _id = 1;
const nextId = () => `EMP-${String(_id++).padStart(4, "0")}`;

// Build all name combinations, shuffle once, hand out in order — no repeats
const FIRST = [
  "Alex","Jordan","Morgan","Taylor","Casey","Riley","Quinn","Avery",
  "Blake","Cameron","Dakota","Drew","Emery","Finley","Gray","Harper",
  "Hayden","Jamie","Kendall","Lane","Logan","Mackenzie","Marlowe","Micah",
  "Nico","Parker","Peyton","Reese","Robin","Rowan","Sage","Sawyer",
  "Scout","Shawn","Skyler","Spencer","Sterling","Sydney","Tatum","Terry",
  "Tobin","Trace","Tyler","Val","Wren","Zara","Zion","Elliot","Frankie","Gene"
];

const LAST = [
  "Abbott","Bauer","Chen","Diaz","Ellis","Flynn","Grant","Hayes",
  "Ingram","Jones","Klein","Lowe","Marsh","Nash","Osei","Patel",
  "Quinn","Reyes","Stone","Torres","Upton","Vance","Walsh","Xu",
  "Yates","Zhang","Adler","Beck","Cole","Dean","Eaton","Ford",
  "Gibbs","Hunt","Irwin","James","Kane","Lee","Moon","Noble",
  "Olsen","Park","Reid","Shaw","Tran","Uddin","Vogel","West","Yoon","Zane"
];

// Generate all combinations then shuffle using Fisher-Yates
const allNames = [];
for (const first of FIRST) {
  for (const last of LAST) {
    allNames.push(`${first} ${last}`);
  }
}
for (let i = allNames.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [allNames[i], allNames[j]] = [allNames[j], allNames[i]];
}

let _nameIdx = 0;
const nextName = () => allNames[_nameIdx++];

const randomDate = (start, end) => {
  const d = new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
  return d.toISOString().split("T")[0];
};

const hireDate = () =>
  randomDate(new Date("2018-01-01"), new Date("2025-06-01"));

// ─── EMPLOYEE BUILDER ─────────────────────────────────────────────────────────

function buildOrgUnit({ org_unit, staff_type, shape, project_code = null }) {
  const employees = [];
  const roleIndex = {};

  for (const [role, count] of Object.entries(shape)) {
    roleIndex[role] = [];
    for (let i = 0; i < count; i++) {
      const emp = {
        employee_id: nextId(),
        name: nextName(),
        staff_type,
        role,
        org_unit,
        region: REGION,
        hire_date: hireDate(),
        project_code,
        line_manager_id: null,
        talent_manager_id: null,
      };
      employees.push(emp);
      roleIndex[role].push(emp.employee_id);
    }
  }

  return { employees, roleIndex };
}

function wirePractice(employees, roleIndex) {
  const practiceHeadId = roleIndex["Practice Head"][0];
  const tmId = roleIndex["Talent Manager"][0];
  const partnerIds = roleIndex["Partner"];
  const principalIds = roleIndex["Principal"];
  const pmIds = roleIndex["PM"];
  const consultantIds = roleIndex["Consultant"];

  const byId = Object.fromEntries(employees.map((e) => [e.employee_id, e]));

  partnerIds.forEach((id) => {
    byId[id].line_manager_id = practiceHeadId;
  });

  principalIds.forEach((id, i) => {
    byId[id].line_manager_id = partnerIds[i % partnerIds.length];
  });

  pmIds.forEach((id, i) => {
    byId[id].line_manager_id = principalIds[i % principalIds.length];
  });

  consultantIds.forEach((id, i) => {
    byId[id].line_manager_id = pmIds[i % pmIds.length];
    byId[id].talent_manager_id = tmId;
  });

  byId[tmId].line_manager_id = practiceHeadId;
}

function wireSupportDept(employees, roleIndex, rCOOId) {
  const deptLeaderId = roleIndex["Dept Leader"][0];
  const tmId = roleIndex["Talent Manager"][0];
  const lineManagerIds = roleIndex["Line Manager"];
  const staffIds = roleIndex["Support Staff"];

  const byId = Object.fromEntries(employees.map((e) => [e.employee_id, e]));

  byId[deptLeaderId].line_manager_id = rCOOId;

  lineManagerIds.forEach((id) => {
    byId[id].line_manager_id = deptLeaderId;
  });

  staffIds.forEach((id, i) => {
    byId[id].line_manager_id = lineManagerIds[i % lineManagerIds.length];
    byId[id].talent_manager_id = tmId;
  });

  byId[tmId].line_manager_id = deptLeaderId;
}

// ─── MAIN ────────────────────────────────────────────────────────────────────

function generate() {
  const allEmployees = [];
  const projects = [];

  // Regional COO
  const rCOO = {
    employee_id: nextId(),
    name: nextName(),
    staff_type: "Support",
    role: "Regional COO",
    org_unit: "Region Ops",
    region: REGION,
    hire_date: hireDate(),
    project_code: null,
    line_manager_id: null,
    talent_manager_id: null,
  };
  allEmployees.push(rCOO);

  // Practices
  for (const practice of PRACTICES) {
    const projectId = `PROJ-${practice.substring(0, 3).toUpperCase()}`;
    projects.push({
      project_id: projectId,
      project_name: `${practice} Core`,
      practice,
    });

    const { employees, roleIndex } = buildOrgUnit({
      org_unit: practice,
      staff_type: "Consultant",
      shape: PRACTICE_SHAPE,
      project_code: projectId,
    });

    wirePractice(employees, roleIndex);
    allEmployees.push(...employees);
  }

  // Support Depts
  for (const dept of SUPPORT_DEPTS) {
    const { employees, roleIndex } = buildOrgUnit({
      org_unit: dept,
      staff_type: "Support",
      shape: SUPPORT_SHAPE,
    });

    wireSupportDept(employees, roleIndex, rCOO.employee_id);
    allEmployees.push(...employees);
  }

  // Admin — 10 dAdmins + 10 admin staff
  for (let i = 0; i < 10; i++) {
    allEmployees.push({
      employee_id: nextId(),
      name: nextName(),
      staff_type: "Support",
      role: "dAdmin",
      org_unit: "Admin",
      region: REGION,
      hire_date: hireDate(),
      project_code: null,
      line_manager_id: null,
      talent_manager_id: null,
    });
  }

  for (let i = 0; i < 10; i++) {
    allEmployees.push({
      employee_id: nextId(),
      name: nextName(),
      staff_type: "Support",
      role: "Admin Staff",
      org_unit: "Admin",
      region: REGION,
      hire_date: hireDate(),
      project_code: null,
      line_manager_id: null,
      talent_manager_id: null,
    });
  }

  // Assign dAdmins to modules
  const dAdminIds = allEmployees
    .filter((e) => e.role === "dAdmin")
    .map((e) => e.employee_id);

  const modules = MODULE_DEFINITIONS.map((mod, i) => ({
    ...mod,
    dadmin_id: dAdminIds[i % dAdminIds.length],
  }));

  // Write output
  mkdirSync(OUTPUT_DIR, { recursive: true });

  writeFileSync(
    join(OUTPUT_DIR, "employees.json"),
    JSON.stringify(allEmployees, null, 2)
  );
  writeFileSync(
    join(OUTPUT_DIR, "modules.json"),
    JSON.stringify(modules, null, 2)
  );
  writeFileSync(
    join(OUTPUT_DIR, "projects.json"),
    JSON.stringify(projects, null, 2)
  );

  console.log(`✓ ${allEmployees.length} employees`);
  console.log(`✓ ${modules.length} modules`);
  console.log(`✓ ${projects.length} projects`);
  console.log(`→ Written to ${OUTPUT_DIR}`);
}

generate();
