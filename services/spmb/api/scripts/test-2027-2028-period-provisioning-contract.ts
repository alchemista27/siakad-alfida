import assert from "node:assert/strict";
import {
  build2027_2028PeriodCreateData,
  plan2027_2028Periods,
  TARGET_PERIOD_LABEL,
  type PeriodSnapshot,
} from "../src/periods/period-2027-2028-provisioning";

function period(overrides: Partial<PeriodSnapshot> = {}): PeriodSnapshot {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    unitId: "22222222-2222-4222-8222-222222222222",
    unitName: "Unit Uji",
    unitSlug: "unit-uji",
    label: "2026/2027",
    educationLevel: "sd",
    tkGroup: null,
    isOpen: false,
    quota: 60,
    fee: 250000,
    bankName: "BSI",
    bankNumber: "masked",
    bankHolder: "Yayasan",
    sourceAcademicYearId: null,
    opensAt: null,
    closesAt: null,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    ...overrides,
  };
}

function actionFor(actions: ReturnType<typeof plan2027_2028Periods>, unitId: string) {
  const action = actions.find((candidate) => candidate.unitId === unitId);
  assert(action, `missing action for ${unitId}`);
  return action;
}

function main() {
  assert.equal(TARGET_PERIOD_LABEL, "2027/2028");

  const tkUnit = "10000000-0000-4000-8000-000000000001";
  const sdUnit = "10000000-0000-4000-8000-000000000002";
  const smpUnit = "10000000-0000-4000-8000-000000000003";
  const smaUnit = "10000000-0000-4000-8000-000000000004";
  const existingVariantUnit = "10000000-0000-4000-8000-000000000005";
  const missingLevelUnit = "10000000-0000-4000-8000-000000000006";
  const legacyMappedSmaUnit = "28225003-d1d3-4276-901c-f9a42a7cac69";
  const tkParentChoiceUnit = "10000000-0000-4000-8000-000000000007";
  const excludedUnit = "18d0d36c-aea5-4ba6-a89b-320f9a4f240d";

  const actions = plan2027_2028Periods([
    period({ id: "20000000-0000-4000-8000-000000000001", unitId: tkUnit, unitName: "TK Uji", educationLevel: "tk", tkGroup: "a" }),
    period({ id: "20000000-0000-4000-8000-000000000002", unitId: sdUnit, unitName: "SD Uji", educationLevel: "sd" }),
    period({ id: "20000000-0000-4000-8000-000000000003", unitId: smpUnit, unitName: "SMP Uji", educationLevel: "smp" }),
    period({ id: "20000000-0000-4000-8000-000000000004", unitId: smaUnit, unitName: "SMA Uji", educationLevel: "sma" }),
    period({ id: "20000000-0000-4000-8000-000000000005", unitId: existingVariantUnit, unitName: "TK Existing", educationLevel: "tk", tkGroup: "b" }),
    period({ id: "20000000-0000-4000-8000-000000000006", unitId: existingVariantUnit, unitName: "TK Existing", label: "SPMB 2027/2028", educationLevel: "tk", tkGroup: "b", quota: 100, createdAt: new Date("2026-10-26T00:00:00.000Z") }),
    period({ id: "20000000-0000-4000-8000-000000000007", unitId: missingLevelUnit, unitName: "Unknown", educationLevel: null }),
    period({ id: "20000000-0000-4000-8000-000000000010", unitId: legacyMappedSmaUnit, unitName: "SMA Islam Terpadu Iqra", educationLevel: null }),
    period({ id: "20000000-0000-4000-8000-000000000008", unitId: tkParentChoiceUnit, unitName: "TK Parent Choice", educationLevel: "tk", tkGroup: null }),
    period({ id: "20000000-0000-4000-8000-000000000009", unitId: excludedUnit, unitName: "Pesantren Quran Alfida", educationLevel: null }),
  ]);

  const tkAction = actionFor(actions, tkUnit);
  assert.equal(tkAction.kind, "create");
  if (tkAction.kind === "create") {
    assert.equal(tkAction.quota, 100);
    assert.equal(tkAction.source.tkGroup, "a");
  }

  for (const [unitId, expectedQuota] of [[sdUnit, 175], [smpUnit, 450], [smaUnit, 450]] as const) {
    const action = actionFor(actions, unitId);
    assert.equal(action.kind, "create");
    if (action.kind === "create") assert.equal(action.quota, expectedQuota);
  }

  const existingAction = actionFor(actions, existingVariantUnit);
  assert.equal(existingAction.kind, "skipped_existing", "SPMB 2027/2028 must count as an existing target wave");

  const parentChoiceAction = actionFor(actions, tkParentChoiceUnit);
  assert.equal(parentChoiceAction.kind, "create", "a TK unit without a legacy fixed group must be provisioned for parent choice");
  if (parentChoiceAction.kind === "create") {
    assert.equal(build2027_2028PeriodCreateData(parentChoiceAction.source, parentChoiceAction.quota).tkGroup, null);
  }

  const legacyMappedAction = actionFor(actions, legacyMappedSmaUnit);
  assert.equal(legacyMappedAction.kind, "create", "audited legacy units must receive their explicit education-level override");
  if (legacyMappedAction.kind === "create") {
    assert.equal(legacyMappedAction.source.educationLevel, "sma");
    assert.equal(legacyMappedAction.quota, 450);
  }

  assert.equal(actionFor(actions, missingLevelUnit).kind, "blocked_missing_education_level");
  assert.equal(actionFor(actions, excludedUnit).kind, "excluded_missing_quota_policy");

  const plannedQuota = actions.reduce((total, action) => total + (action.kind === "create" ? action.quota : 0), 0);
  assert.equal(plannedQuota, 1725, "six missing eligible test units must total 100 + 175 + 450 + 450 + 100 + 450");

  console.log("SPMB 2027/2028 period provisioning contract passed");
}

main();
