import { redirect } from "next/navigation";

export default function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  redirect("/login");
}
