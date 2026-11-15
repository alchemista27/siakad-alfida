export const TARGET_PERIOD_LABEL = "2027/2028" as const;

export const QUOTA_BY_EDUCATION_LEVEL = {
  tk: 100,
  sd: 175,
  smp: 450,
  sma: 450,
} as const;

export type ProvisionableEducationLevel = keyof typeof QUOTA_BY_EDUCATION_LEVEL;

export const EXCLUDED_UNIT_IDS = new Set([
  "18d0d36c-aea5-4ba6-a89b-320f9a4f240d", // Pesantren Quran Alfida: no quota policy supplied.
]);

// These unit IDs were audited against the current production catalog on 2026-11-15.
// They are an explicit migration bridge for legacy source periods that predate
// AdmissionPeriod.educationLevel; no legacy period is mutated.
export const EDUCATION_LEVEL_OVERRIDE_BY_UNIT_ID: Readonly<Record<string, ProvisionableEducationLevel>> = {
  "28225003-d1d3-4276-901c-f9a42a7cac69": "sma", // SMA Islam Terpadu Iqra
  "5edd8be0-86ac-406b-b23c-418b3e387528": "sd", // SD Islam Terpadu Iqra 3
  "9fe99902-40e0-48dd-9275-d73531584365": "tk", // TK Islam Terpadu Auladuna 2
  "a09edaf4-c656-4632-abf1-4c0a25150c98": "smp", // SMP Islam Terpadu Iqra
  "c09fb430-b5d3-4ae2-a6cc-2220430da453": "sd", // SD Islam Terpadu Iqra 2
  "dcaa14b2-b20c-416a-ba90-9367016ce295": "sd", // SD Islam Terpadu Iqra 1
};

export type PeriodSnapshot = {
  id: string;
  unitId: string;
  unitName: string;
  unitSlug: string;
  label: string;
  educationLevel: ProvisionableEducationLevel | null;
  tkGroup: "a" | "b" | null;
  isOpen: boolean;
  quota: number;
  fee: number;
  bankName: string | null;
  bankNumber: string | null;
  bankHolder: string | null;
  sourceAcademicYearId: string | null;
  opensAt: Date | null;
  closesAt: Date | null;
  createdAt: Date;
};

export type ProvisionAction =
  | { kind: "create"; unitId: string; source: PeriodSnapshot; quota: number }
  | { kind: "skipped_existing"; unitId: string; target: PeriodSnapshot; requestedQuota: number | null }
  | { kind: "blocked_missing_education_level"; unitId: string; source: PeriodSnapshot }
  | { kind: "excluded_missing_quota_policy"; unitId: string; source: PeriodSnapshot };

function normalizedLabel(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

export function is2027_2028TargetLabel(label: string) {
  const normalized = normalizedLabel(label);
  return normalized === "2027/2028" || normalized === "spmb 2027/2028";
}

function newest<T extends PeriodSnapshot>(periods: readonly T[]) {
  return [...periods].sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime())[0];
}

export function plan2027_2028Periods(periods: readonly PeriodSnapshot[]): ProvisionAction[] {
  const byUnit = new Map<string, PeriodSnapshot[]>();
  for (const period of periods) {
    const group = byUnit.get(period.unitId) || [];
    group.push(period);
    byUnit.set(period.unitId, group);
  }

  return [...byUnit.values()]
    .map((unitPeriods) => {
      const target = newest(unitPeriods.filter((period) => is2027_2028TargetLabel(period.label)));
      if (target) {
        const requestedQuota = target.educationLevel ? QUOTA_BY_EDUCATION_LEVEL[target.educationLevel] : null;
        return { kind: "skipped_existing", unitId: target.unitId, target, requestedQuota } as const;
      }

      const source = newest(unitPeriods.filter((period) => !is2027_2028TargetLabel(period.label)));
      if (!source) throw new Error(`Unit ${unitPeriods[0]?.unitId || "unknown"} tidak memiliki periode sumber.`);
      if (EXCLUDED_UNIT_IDS.has(source.unitId)) {
        return { kind: "excluded_missing_quota_policy", unitId: source.unitId, source } as const;
      }
      const educationLevel = source.educationLevel || EDUCATION_LEVEL_OVERRIDE_BY_UNIT_ID[source.unitId];
      if (!educationLevel) {
        return { kind: "blocked_missing_education_level", unitId: source.unitId, source } as const;
      }
      const resolvedSource = source.educationLevel === educationLevel
        ? source
        : { ...source, educationLevel };
      return {
        kind: "create",
        unitId: source.unitId,
        source: resolvedSource,
        quota: QUOTA_BY_EDUCATION_LEVEL[educationLevel],
      } as const;
    })
    .sort((left, right) => left.unitId.localeCompare(right.unitId));
}

export function build2027_2028PeriodCreateData(source: PeriodSnapshot, quota: number) {
  if (!source.educationLevel) throw new Error("Jenjang pendidikan periode sumber wajib diisi.");

  return {
    unitId: source.unitId,
    unitName: source.unitName,
    unitSlug: source.unitSlug,
    label: TARGET_PERIOD_LABEL,
    educationLevel: source.educationLevel,
    tkGroup: null,
    isOpen: false,
    quota,
    fee: source.fee,
    bankName: source.bankName,
    bankNumber: source.bankNumber,
    bankHolder: source.bankHolder,
    opensAt: new Date("2026-11-01T00:00:00.000Z"),
    closesAt: new Date("2026-11-30T00:00:00.000Z"),
    sourceAcademicYearId: null,
  };
}
