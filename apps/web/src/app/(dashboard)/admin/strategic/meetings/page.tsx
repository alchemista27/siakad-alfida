import { cookies } from "next/headers";
import MeetingsClient from "./client";
import { getExecutionMeetings, getStrategicUsers } from "@/actions/strategic";

export default async function MeetingsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("better-auth.session_token")?.value
    || cookieStore.get("__Secure-better-auth.session_token")?.value;
  if (!token) return null;

  const [meetings, users] = await Promise.all([
    getExecutionMeetings(token).catch(() => []),
    getStrategicUsers().then(res => res || []).catch(() => []),
  ]);

  return <MeetingsClient meetings={meetings} users={users} />;
}
