export type DepartmentProjection = {
  id: string;
  name: string;
  code: string;
  description: string | null;
  isActive: boolean;
  updatedAt: Date;
};

export type OrganizationSyncEvent = {
  aggregate: "department" | "user";
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
      eventType: department.isActive ? "department.upserted" : "department.archived",
      payload: { id: department.id, name: department.name, code: department.code, description: department.description, isActive: department.isActive, updatedAt: department.updatedAt.toISOString() },
      updatedAt: department.updatedAt.toISOString(),
    };
  }

  departmentDeletionEvent(department: { id: string }): OrganizationSyncEvent {
    const deletedAt = new Date().toISOString();
    return {
      aggregate: "department",
      aggregateId: department.id,
      eventType: "department.deleted",
      payload: { id: department.id, deletedAt },
      updatedAt: deletedAt,
    };
  }

  idempotencyKey(event: OrganizationSyncEvent) {
    return `${event.aggregate}:${event.aggregateId}:${event.updatedAt}`;
  }

  failedDelivery(event: OrganizationSyncEvent, lastError: string) {
    return { ...event, status: "failed" as const, lastError, availableAt: new Date(Date.now() + 60_000) };
  }
}
