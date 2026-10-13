import { createParamDecorator, ExecutionContext, SetMetadata } from "@nestjs/common";
import { AppName } from "@alfida/contracts";

export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data ? user?.[data] : user;
  }
);

export const REQUIRE_ROLE_KEY = "require_role";

export interface RequireRoleOptions {
  app?: AppName | "*";
  unitParam?: string;
  deptParam?: string;
}

export const RequireRole = (role: string, options?: RequireRoleOptions) =>
  SetMetadata(REQUIRE_ROLE_KEY, { role, ...options });
