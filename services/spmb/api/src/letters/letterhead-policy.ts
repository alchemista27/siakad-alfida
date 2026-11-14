export type LetterheadKind = "unit" | "foundation";

export type UnitLetterheadIdentity = {
  unitName: string | null | undefined;
  address: string | null | undefined;
  phone: string | null | undefined;
  email: string | null | undefined;
  logoUrl: string | null | undefined;
};

function hasText(value: string | null | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function resolveLetterheadKind(unit: UnitLetterheadIdentity): LetterheadKind {
  return hasText(unit.unitName)
    && hasText(unit.address)
    && hasText(unit.phone)
    && hasText(unit.email)
    && hasText(unit.logoUrl)
    ? "unit"
    : "foundation";
}
