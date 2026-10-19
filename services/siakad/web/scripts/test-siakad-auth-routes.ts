import { NextRequest } from "next/server";
import { middleware } from "../src/middleware";

function request(path: string, options: { cookies?: string; forwardedHost?: string; forwardedProto?: string } = {}) {
  const headers = new Headers();
  if (options.cookies) headers.set("cookie", options.cookies);
  if (options.forwardedHost) headers.set("x-forwarded-host", options.forwardedHost);
  if (options.forwardedProto) headers.set("x-forwarded-proto", options.forwardedProto);
  return new NextRequest(`https://siakad.alfida.or.id${path}`, { headers });
}

const protectedResponse = middleware(
  request("/admin/academic-years?unit=unit-a", {
    forwardedHost: "siakad.alfida.or.id",
    forwardedProto: "https",
  }),
);
if (protectedResponse.status !== 307) {
  throw new Error("protected route without a session must redirect");
}
const destination = protectedResponse.headers.get("location");
if (!destination?.startsWith("https://auth.alfida.or.id/login?")) {
  throw new Error("protected route must redirect to central auth login");
}
const returnTo = new URL(destination).searchParams.get("return_to");
if (returnTo !== "https://siakad.alfida.or.id/admin/academic-years?unit=unit-a") {
  throw new Error("redirect must preserve the proxy-visible return URL");
}

const authenticatedResponse = middleware(request("/teacher/journals", { cookies: "alfida_session=token" }));
if (authenticatedResponse.headers.get("location")) {
  throw new Error("authenticated protected route must not redirect");
}

const rootResponse = middleware(request("/"));
if (rootResponse.status !== 307 || !rootResponse.headers.get("location")?.startsWith("https://auth.alfida.or.id/login?")) {
  throw new Error("SIAKAD root must be protected and redirect unauthenticated users to central auth");
}

console.log("SIAKAD auth route contract passed");
