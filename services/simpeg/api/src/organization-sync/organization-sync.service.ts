import { Injectable } from "@nestjs/common";
import {
  OrganizationSyncOutboxPolicy,
  type DepartmentMemberProjection,
  type UnitProjection,
  type UserProjection,
} from "./organization-sync.policy";

const AUTH_ROLE_COMPENSATION_GRACE_MS = 5 * 60_000;
const LEGACY_USER_PROJECTION_VERSION = new Date(0);

type AuthRoleCompensationInput = {
  localAssignmentId: string;
  scope: "unit" | "department";
  userId: string;
  scopeId: string;
  app: string;
  role: string;
  requestedById?: string;
};

@Injectable()
export class OrganizationSyncService {
  private readonly policy = new OrganizationSyncOutboxPolicy();

  async enqueueDepartment(
    tx: any,
    department: {
      id: string;
      unitId?: string | null;
      name: string;
      code: string;
      description: string | null;
      isActive: boolean;
      updatedAt: Date;
      parentId?: string | null;
      leaderId?: string | null;
    }
  ) {
    const event = this.policy.departmentEvent(department);
    return tx.organizationSyncOutbox.upsert({
      where: { idempotencyKey: this.policy.idempotencyKey(event) },
      create: {
        aggregate: event.aggregate,
        aggregateId: event.aggregateId,
        eventType: event.eventType,
        payload: event.payload,
        idempotencyKey: this.policy.idempotencyKey(event),
      },
      update: {},
    });
  }

  async enqueueDepartmentDeletion(
    tx: any,
    department: { id: string; sourceUpdatedAt?: Date | null }
  ) {
    const event = this.policy.departmentDeletionEvent(department);
    return tx.organizationSyncOutbox.upsert({
      where: { idempotencyKey: this.policy.idempotencyKey(event) },
      create: {
        aggregate: event.aggregate,
        aggregateId: event.aggregateId,
        eventType: event.eventType,
        payload: event.payload,
        idempotencyKey: this.policy.idempotencyKey(event),
      },
      update: {},
    });
  }

  async enqueueDepartmentMember(tx: any, member: DepartmentMemberProjection) {
    const event = this.policy.departmentMemberEvent(member);
    return tx.organizationSyncOutbox.upsert({
      where: { idempotencyKey: this.policy.idempotencyKey(event) },
      create: {
        aggregate: event.aggregate,
        aggregateId: event.aggregateId,
        eventType: event.eventType,
        payload: event.payload,
        idempotencyKey: this.policy.idempotencyKey(event),
      },
      update: {},
    });
  }

  async enqueueUnit(tx: any, unit: UnitProjection) {
    const event = this.policy.unitEvent(unit);
    return tx.organizationSyncOutbox.upsert({
      where: { idempotencyKey: this.policy.idempotencyKey(event) },
      create: {
        aggregate: event.aggregate,
        aggregateId: event.aggregateId,
        eventType: event.eventType,
        payload: event.payload,
        idempotencyKey: this.policy.idempotencyKey(event),
      },
      update: {},
    });
  }

  async enqueueUser(
    tx: any,
    user: Omit<UserProjection, "updatedAt"> & { updatedAt?: Date | null }
  ) {
    const event = this.policy.userEvent({
      ...user,
      updatedAt: user.updatedAt ?? LEGACY_USER_PROJECTION_VERSION,
    });
    return tx.organizationSyncOutbox.upsert({
      where: { idempotencyKey: this.policy.idempotencyKey(event) },
      create: {
        aggregate: event.aggregate,
        aggregateId: event.aggregateId,
        eventType: event.eventType,
        payload: event.payload,
        idempotencyKey: this.policy.idempotencyKey(event),
      },
      update: {},
    });
  }

  async armAuthRoleRevocation(tx: any, input: AuthRoleCompensationInput) {
    if (!tx.authRoleCompensation) return null;
    const idempotencyKey = `auth-role-revoke:${input.scope}:${input.localAssignmentId}`;
    const availableAt = new Date(Date.now() + AUTH_ROLE_COMPENSATION_GRACE_MS);
    return tx.authRoleCompensation.upsert({
      where: { idempotencyKey },
      create: { ...input, idempotencyKey, status: "armed", availableAt },
      update: {
        ...input,
        authAssignmentId: null,
        status: "armed",
        attemptCount: 0,
        lastError: null,
        availableAt,
        deliveredAt: null,
      },
    });
  }

  async completeAuthRoleGrant(
    tx: any,
    compensationId: string | null | undefined,
    authAssignmentId: string
  ) {
    if (!compensationId || !tx.authRoleCompensation) return;
    await tx.authRoleCompensation.update({
      where: { id: compensationId },
      data: {
        authAssignmentId,
        status: "delivered",
        deliveredAt: new Date(),
        lastError: null,
      },
    });
  }

  async scheduleAuthRoleRevocation(
    tx: any,
    compensationId: string | null | undefined,
    authAssignmentId: string
  ) {
    if (!compensationId || !tx.authRoleCompensation) return;
    await tx.authRoleCompensation.update({
      where: { id: compensationId },
      data: {
        authAssignmentId,
        status: "pending",
        availableAt: new Date(),
        deliveredAt: null,
        lastError: null,
      },
    });
  }

  async cancelAuthRoleRevocation(
    tx: any,
    compensationId: string | null | undefined
  ) {
    if (!compensationId || !tx.authRoleCompensation) return;
    await tx.authRoleCompensation.update({
      where: { id: compensationId },
      data: { status: "delivered", deliveredAt: new Date(), lastError: null },
    });
  }
}
