export class BureauAdminRoleLifecycle {
  async assign(operations: {
    createLocal(): Promise<void>;
    removeLocal(): Promise<void>;
    grantAuth(): Promise<string>;
    revokeAuth(assignmentId: string): Promise<void>;
    persistAuthAssignment(id: string): Promise<void>;
  }) {
    await operations.createLocal();
    let assignmentId: string | undefined;
    try {
      assignmentId = await operations.grantAuth();
      await operations.persistAuthAssignment(assignmentId);
      return assignmentId;
    } catch (error) {
      if (assignmentId) await operations.revokeAuth(assignmentId);
      await operations.removeLocal();
      throw error;
    }
  }

  async revoke(operations: { revokeAuth(): Promise<void>; removeLocal(): Promise<void> }) {
    await operations.revokeAuth();
    await operations.removeLocal();
  }
}
