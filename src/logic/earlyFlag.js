/**
 * Returns null (type A), true (type B, delivery ≥ 28 days), or false (type B, delivery < 28 days).
 * Uses client clock — acceptable for demo. Production fix: server-side trusted timestamp.
 *
 * @param {object} module        - Module record from modules.json
 * @param {Date|string|number}   submissionTimestamp - When the case is being submitted
 * @returns {boolean|null}
 */
export function calculateEarlyFlag(module, submissionTimestamp) {
  if (module.module_type === 'A') return null;

  // Normalise both sides to midnight local time to avoid DST / time-of-day drift
  const submissionDay = new Date(submissionTimestamp);
  submissionDay.setHours(0, 0, 0, 0);

  // deployment_date is a YYYY-MM-DD string — parse as local midnight
  const [year, month, day] = module.deployment_date.split('-').map(Number);
  const deliveryDay = new Date(year, month - 1, day);

  const msPerDay = 1000 * 60 * 60 * 24;
  const daysDiff = Math.round((deliveryDay - submissionDay) / msPerDay);

  return daysDiff >= 28;
}


// ---------------------------------------------------------------------------
// TEST BLOCK — remove or guard behind import.meta.env.DEV before wiring to
// the submission flow. All three branches + 28-day boundary must pass.
// ---------------------------------------------------------------------------
function runEarlyFlagTests() {
  const MS = 1000 * 60 * 60 * 24;

  const base = new Date();
  base.setHours(12, 0, 0, 0); // use noon to avoid midnight edge cases

  const dateInDays = (n) => {
    const d = new Date(base.getTime() + n * MS);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const moduleA    = { module_type: 'A', deployment_date: dateInDays(30) };
  const moduleB28  = { module_type: 'B', deployment_date: dateInDays(28) };
  const moduleB27  = { module_type: 'B', deployment_date: dateInDays(27) };
  const moduleBFar = { module_type: 'B', deployment_date: dateInDays(60) };

  const cases = [
    { label: 'Type A (any delivery)         → null',  mod: moduleA,    expected: null  },
    { label: 'Type B, 28 days out           → true',  mod: moduleB28,  expected: true  },
    { label: 'Type B, 27 days out           → false', mod: moduleB27,  expected: false },
    { label: 'Type B, 60 days out           → true',  mod: moduleBFar, expected: true  },
  ];

  let passed = 0;
  console.group('[PE-01] earlyFlag tests');
  for (const { label, mod, expected } of cases) {
    const result = calculateEarlyFlag(mod, base);
    const ok = result === expected;
    console.log(`${ok ? '✓' : '✗'} ${label}  (got: ${result})`);
    if (ok) passed++;
  }
  console.log(`${passed}/${cases.length} passed`);
  console.groupEnd();
}

runEarlyFlagTests();
