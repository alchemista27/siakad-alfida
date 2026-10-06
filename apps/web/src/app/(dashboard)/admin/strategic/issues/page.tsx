import { cookies } from "next/headers";
import IssuesClient from "./client";
import { getExecutionIssues, getTasks, getStrategicUsers } from "@/actions/strategic";

export default async function IssuesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("better-auth.session_token")?.value
    || cookieStore.get("__Secure-better-auth.session_token")?.value;
  if (!token) return null;

  const [issues, tasks, users] = await Promise.all([
    getExecutionIssues(token).catch(() => []),
    getTasks().catch(() => []),
    getStrategicUsers().catch(() => []),
  ]);

  return <IssuesClient issues={issues} tasks={tasks} users={users} />;
}
