export type AuditUnit = {
  id: string;
  name: string;
  code: string;
  category: string;
  isActive: boolean;
};

type SimpegAssignment = {
  unitId: string;
  userId: string;
  app: string;
  role: string;
  isActive: boolean;
};

type AuthAssignment = {
  unitId: string | null;
  userId: string;
  app: string;
  role: string;
};

type AuthUser = {
  id: string;
  fullName: string;
  email: string;
  username: string | null;
  isActive: boolean;
  createdAt: Date;
};

type AuditInput = {
  units: AuditUnit[];
  simpegAssignments: SimpegAssignment[];
  authAssignments: AuthAssignment[];
  authUsers: AuthUser[];
};

type UnitStatus = {
  id: string;
  name: string;
  code: string;
  category: string;
  expectedRole: "admin_unit" | "admin_unit_nondik";
  simpegAdminCount: number;
  authAdminCount: number;
};

export const normalizePersonName = (value: string) => value.trim().replace(/\s+/g, " ").toLocaleLowerCase("id-ID");

export const expectedRoleForUnit = (category: string): "admin_unit" | "admin_unit_nondik" => (
  category === "nondik" ? "admin_unit_nondik" : "admin_unit"
);

export const maskEmail = (email: string) => {
  const [local, domain = ""] = email.split("@");
  return `${local.slice(0, 2)}***@${domain}`;
};

function sortUnitStatus(items: UnitStatus[]) {
  return items.sort((left, right) => left.code.localeCompare(right.code, "id-ID") || left.name.localeCompare(right.name, "id-ID"));
}

function uniqueMatchingUsers(
  assignments: Array<{ unitId: string | null; userId: string; app: string; role: string; isActive?: boolean }>,
  unit: AuditUnit,
  source: "simpeg" | "auth",
) {
  const expectedRole = expectedRoleForUnit(unit.category);
  return new Set(assignments
    .filter((assignment) => (
      assignment.unitId === unit.id
      && assignment.app === "simpeg"
      && assignment.role === expectedRole
      && (source === "auth" || assignment.isActive === true)
    ))
    .map((assignment) => assignment.userId));
}

function intersectionSize(left: Set<string>, right: Set<string>) {
  let result = 0;
  for (const value of left) if (right.has(value)) result += 1;
  return result;
}

export function buildUnitAdminAudit(input: AuditInput) {
  const healthy: UnitStatus[] = [];
  const missingEverywhere: UnitStatus[] = [];
  const simpegOnly: UnitStatus[] = [];
  const authOnly: UnitStatus[] = [];
  const identityMismatch: UnitStatus[] = [];
  const activeUnits = input.units.filter((unit) => unit.isActive);

  for (const unit of activeUnits) {
    const simpegUsers = uniqueMatchingUsers(input.simpegAssignments, unit, "simpeg");
    const authUsers = uniqueMatchingUsers(input.authAssignments, unit, "auth");
    const item: UnitStatus = {
      id: unit.id,
      name: unit.name,
      code: unit.code,
      category: unit.category,
      expectedRole: expectedRoleForUnit(unit.category),
      simpegAdminCount: simpegUsers.size,
      authAdminCount: authUsers.size,
    };

    if (intersectionSize(simpegUsers, authUsers) > 0) healthy.push(item);
    else if (simpegUsers.size === 0 && authUsers.size === 0) missingEverywhere.push(item);
    else if (simpegUsers.size > 0 && authUsers.size === 0) simpegOnly.push(item);
    else if (simpegUsers.size === 0 && authUsers.size > 0) authOnly.push(item);
    else identityMismatch.push(item);
  }

  const accounts = input.authUsers
    .filter((user) => normalizePersonName(user.fullName) === "septian jauhariansyah")
    .sort((left, right) => left.createdAt.getTime() - right.createdAt.getTime() || (left.username ?? "").localeCompare(right.username ?? "", "id-ID"))
    .map((user) => ({
      email: maskEmail(user.email),
      username: user.username,
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString(),
    }));

  return {
    generatedAt: new Date().toISOString(),
    units: {
      activeUnitCount: activeUnits.length,
      inactiveUnitCount: input.units.length - activeUnits.length,
      healthyCount: healthy.length,
      missingEverywhere: sortUnitStatus(missingEverywhere),
      simpegOnly: sortUnitStatus(simpegOnly),
      authOnly: sortUnitStatus(authOnly),
      identityMismatch: sortUnitStatus(identityMismatch),
    },
    septianJauhariansyah: {
      authIdentityCount: accounts.length,
      activeIdentityCount: accounts.filter((account) => account.isActive).length,
      accounts,
    },
  };
}
