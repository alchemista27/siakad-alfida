import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import type { SiskeuPrincipal } from "./siskeu-roles.guard";

export const CurrentPrincipal = createParamDecorator(
  (_data: unknown, context: ExecutionContext): SiskeuPrincipal => context.switchToHttp().getRequest().user,
);
