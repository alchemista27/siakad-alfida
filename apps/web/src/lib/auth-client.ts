import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: "http://187.127.113.61:3000"
});
