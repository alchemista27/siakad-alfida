import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import type { SiakadPrincipal } from "../common/siakad-scope-policy";

export const CurrentPrincipal = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): SiakadPrincipal => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
