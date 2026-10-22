import { SetMetadata } from "@nestjs/common";

export const YMQ_ROLES_KEY = "siyaum_ymq_roles";

export const YmqRoles = (...roles: string[]) => SetMetadata(YMQ_ROLES_KEY, roles);
