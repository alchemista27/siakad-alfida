import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import * as bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { createAuthToken, AuthUser } from "@alfida/auth-sdk";
import { UserRoleScope } from "@alfida/contracts";

@Injectable()
export class AuthService {
  private secretKey: string;

  constructor(private readonly prisma: PrismaService) {
    this.secretKey =
      process.env.AUTH_SECRET ||
      process.env.BETTER_AUTH_SECRET ||
      "alfida-sso-secret-key-32-chars-long!!";
  }

  async login(emailOrUsername: string, password: string) {
    if (!emailOrUsername || !password) {
      throw new BadRequestException("Email/username dan password wajib diisi");
    }

    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: emailOrUsername.toLowerCase().trim() },
          { username: emailOrUsername.trim() },
        ],
      },
      include: {
        accounts: true,
        roles: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException("Email/username atau password salah");
    }

    if (!user.isActive) {
      throw new UnauthorizedException("Akun Anda telah dinonaktifkan");
    }

    // Periksa password dari account atau passwordHash user
    let passwordHashToVerify = user.passwordHash;
    const credentialAccount = user.accounts.find((a) => a.providerId === "credential");
    if (credentialAccount?.password) {
      passwordHashToVerify = credentialAccount.password;
    }

    const isValid = await bcrypt.compare(password, passwordHashToVerify);
    if (!isValid) {
      throw new UnauthorizedException("Email/username atau password salah");
    }

    const sessionToken = randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 hari

    await this.prisma.session.create({
      data: {
        id: randomUUID(),
        userId: user.id,
        token: sessionToken,
        expiresAt,
      },
    });

    const userRoles: UserRoleScope[] = user.roles.map((r) => ({
      role: r.role,
      app: r.app as any,
      unitId: r.unitId,
      departmentId: r.departmentId,
    }));

    const jwtToken = await this.createJwtToken(user, userRoles);

    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      username: user.username,
      phone: user.phone,
      roles: userRoles,
      isActive: user.isActive,
    };

    return {
      user: authUser,
      token: jwtToken,
      sessionToken,
      expiresAt,
    };
  }

  async createJwtToken(user: { id: string; email: string; fullName: string }, roles: UserRoleScope[]) {
    return createAuthToken(
      {
        sub: user.id,
        email: user.email,
        name: user.fullName,
        roles,
      },
      this.secretKey,
      {
        issuer: "https://auth.alfida.or.id",
        expiresIn: "7d",
      }
    );
  }

  async logout(sessionToken: string) {
    if (!sessionToken) return;
    await this.prisma.session.deleteMany({
      where: { token: sessionToken },
    });
  }

  async getMe(userId: string): Promise<AuthUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { roles: true },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException("Pengguna tidak ditemukan atau nonaktif");
    }

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      username: user.username,
      phone: user.phone,
      roles: user.roles.map((r) => ({
        role: r.role,
        app: r.app as any,
        unitId: r.unitId,
        departmentId: r.departmentId,
      })),
      isActive: user.isActive,
    };
  }
}
