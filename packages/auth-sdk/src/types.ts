import { UserRoleScope } from "@alfida/contracts";

export const ALFIDA_SESSION_COOKIE = "alfida_session";
export const ALFIDA_COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || ".alfida.or.id";

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  username?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
  roles: UserRoleScope[];
  isActive: boolean;
}

export interface AuthTokenPayload {
  sub: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
  roles: UserRoleScope[];
  iss?: string;
  aud?: string;
  exp?: number;
  iat?: number;
}
