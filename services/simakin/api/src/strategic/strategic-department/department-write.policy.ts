import { ForbiddenException } from "@nestjs/common";

export function assertAllowedDepartmentWrite(input: { route: "generic" | "bureau"; user: unknown }) {
  if (input.route === "generic") throw new ForbiddenException("Generic SIMAKIN department writes are forbidden.");
}
