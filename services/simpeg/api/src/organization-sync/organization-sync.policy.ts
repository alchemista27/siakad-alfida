import type { UnitProjectionPayload } from "@alfida/contracts";

export type DepartmentProjection = {
  id: string;
  unitId?: string | null;
  name: string;
  code: string;
  description: string | null;
  isActive: boolean;
  updatedAt: Date;
  parentId?: string | null;
  leaderId?: string | null;
};

export type DepartmentMemberProjection = {
  id: string;
  departmentId: string;
  userId: string;
  role: string | null;
  sourceCreatedAt: Date | null;
  sourceUpdatedAt: Date;
};

export type UnitProjection = {
  id: string;
  name: string;
  category: "pendidikan" | "nondik";
  isActive: boolean;
  updatedAt: Date;
};

export type UserProjection = {
  id: string;
  fullName: string;
  email: string;
  username: string | null;
  avatarUrl: string | null;
  isActive: boolean;
  updatedAt: Date;
};

export type OrganizationSyncEvent = {
  aggregate: "department" | "department_member" | "unit" | "user";
  aggregateId: string;
  eventType: string;
  payload: Record<string, unknown>;
  updatedAt: string;
};

export class OrganizationSyncOutboxPolicy {
  departmentEvent(department: DepartmentProjection): OrganizationSyncEvent {
    return {
      aggregate: "department",
      aggregateId: department.id,
      eventType: department.isActive
        ? "department.upserted"
        : "department.archived",
      payload: {
        id: department.id,
        unitId: department.unitId ?? null,
        parentId: department.parentId ?? null,
        leaderId: department.leaderId ?? null,
        name: department.name,
        code: department.code,
        description: department.description,
        isActive: department.isActive,
        updatedAt: department.updatedAt.toISOString(),
      },
      updatedAt: department.updatedAt.toISOString(),
    };
  }

  departmentDeletionEvent(department: {
    id: string;
    sourceUpdatedAt?: Date | null;
  }): OrganizationSyncEvent {
    const deletedAt = (department.sourceUpdatedAt ?? new Date(0)).toISOString();
    return {
      aggregate: "department",
      aggregateId: department.id,
      eventType: "department.deleted",
      payload: { id: department.id, deletedAt },
      updatedAt: deletedAt,
    };
  }

  departmentMemberEvent(
    member: DepartmentMemberProjection
  ): OrganizationSyncEvent {
    const sourceUpdatedAt = member.sourceUpdatedAt.toISOString();
    return {
      aggregate: "department_member",
      aggregateId: member.id,
      eventType: "department-member.upserted",
      payload: {
        id: member.id,
        departmentId: member.departmentId,
        userId: member.userId,
        role: member.role,
        sourceCreatedAt: member.sourceCreatedAt?.toISOString() ?? null,
        sourceUpdatedAt,
      },
      updatedAt: sourceUpdatedAt,
    };
  }

  unitEvent(unit: UnitProjection): OrganizationSyncEvent {
    const updatedAt = unit.updatedAt.toISOString();
    const payload: UnitProjectionPayload = {
      id: unit.id,
      name: unit.name,
      slug: `unit-${unit.id.toLowerCase()}`,
      status: unit.isActive ? "active" : "archived",
      category: unit.category,
      sourceUpdatedAt: updatedAt,
    };
    return {
      aggregate: "unit",
      aggregateId: unit.id,
      eventType: unit.isActive ? "unit.upserted" : "unit.archived",
      payload,
      updatedAt,
    };
  }

  userEvent(user: UserProjection): OrganizationSyncEvent {
    const updatedAt = user.updatedAt.toISOString();
    return {
      aggregate: "user",
      aggregateId: user.id,
      eventType: "user.projected",
      payload: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        username: user.username,
        avatarUrl: user.avatarUrl,
        isActive: user.isActive,
        sourceUpdatedAt: updatedAt,
      },
      updatedAt,
    };
  }

  idempotencyKey(event: OrganizationSyncEvent) {
    return `${event.aggregate}:${event.aggregateId}:${event.updatedAt}`;
  }

  failedDelivery(event: OrganizationSyncEvent, lastError: string) {
    return {
      ...event,
      status: "failed" as const,
      lastError,
      availableAt: new Date(Date.now() + 60_000),
    };
  }
}
