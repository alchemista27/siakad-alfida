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
      if (!source.educationLevel) {
        return { kind: "blocked_missing_education_level", unitId: source.unitId, source } as const;
      }
      return {
        kind: "create",
        unitId: source.unitId,
        source,
        quota: QUOTA_BY_EDUCATION_LEVEL[source.educationLevel],
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
