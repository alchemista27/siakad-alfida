import { Injectable } from "@nestjs/common";
import { OrganizationSyncOutboxPolicy } from "./organization-sync.policy";

@Injectable()
export class OrganizationSyncService {
  private readonly policy = new OrganizationSyncOutboxPolicy();

  async enqueueDepartment(tx: any, department: { id: string; name: string; code: string; description: string | null; isActive: boolean; updatedAt: Date }) {
    const event = this.policy.departmentEvent(department);
    return tx.organizationSyncOutbox.upsert({
      where: { idempotencyKey: this.policy.idempotencyKey(event) },
      create: { aggregate: event.aggregate, aggregateId: event.aggregateId, eventType: event.eventType, payload: event.payload, idempotencyKey: this.policy.idempotencyKey(event) },
      update: {},
    });
  }

  async enqueueDepartmentDeletion(tx: any, department: { id: string }) {
    const event = this.policy.departmentDeletionEvent(department);
    return tx.organizationSyncOutbox.upsert({
      where: { idempotencyKey: this.policy.idempotencyKey(event) },
      create: { aggregate: event.aggregate, aggregateId: event.aggregateId, eventType: event.eventType, payload: event.payload, idempotencyKey: this.policy.idempotencyKey(event) },
      update: {},
    });
  }

  async enqueueUser(tx: any, user: { id: string; fullName: string; email: string; username: string | null; avatarUrl: string | null; isActive: boolean }) {
    const payload = { id: user.id, fullName: user.fullName, email: user.email, username: user.username, avatarUrl: user.avatarUrl, isActive: user.isActive };
    const version = new Date().toISOString();
    return tx.organizationSyncOutbox.upsert({
      where: { idempotencyKey: `user:${user.id}:${version}` },
      create: { aggregate: "user", aggregateId: user.id, eventType: "user.projected", payload, idempotencyKey: `user:${user.id}:${version}` },
      update: {},
    });
  }
}
