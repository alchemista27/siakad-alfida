import { cookies } from "next/headers";
import MeetingsClient from "./client";
import { getExecutionMeetings, getStrategicUsers } from "@/actions/strategic";

export default async function MeetingsPage() {
  const token = (await cookies()).get("better-auth.session_token")?.value;
  if (!token) return null;

  const [meetings, users] = await Promise.all([
    getExecutionMeetings(token).catch(() => []),
    getStrategicUsers().catch(() => []),
  ]);

  return <MeetingsClient meetings={meetings} users={users} />;
}
