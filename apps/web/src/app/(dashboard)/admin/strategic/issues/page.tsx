import { cookies } from "next/headers";
import IssuesClient from "./client";
import { getExecutionIssues, getTasks, getStrategicUsers } from "@/actions/strategic";

export default async function IssuesPage() {
  const token = (await cookies()).get("better-auth.session_token")?.value;
  if (!token) return null;

  const [issues, tasks, users] = await Promise.all([
    getExecutionIssues(token).catch(() => []),
    getTasks().catch(() => []),
    getStrategicUsers().catch(() => []),
  ]);

  return <IssuesClient issues={issues} tasks={tasks} users={users} />;
}
