export function createNotificationHref(input: { resourceType: string; resourceId: string; taskId?: string; interventionId?: string }) {
  if (input.taskId) return `/my-tasks?taskId=${encodeURIComponent(input.taskId)}`;
  if (input.interventionId) return `/executive?interventionId=${encodeURIComponent(input.interventionId)}`;
  return `/inbox?resourceType=${encodeURIComponent(input.resourceType)}&resourceId=${encodeURIComponent(input.resourceId)}`;
}
