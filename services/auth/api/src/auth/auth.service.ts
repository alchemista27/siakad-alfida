import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import * as bcrypt from "bcryptjs";
import { randomUUID, createHash } from "crypto";
import { createAuthToken, AuthUser, verifyAuthToken } from "@alfida/auth-sdk";
import { UserRoleScope } from "@alfida/contracts";
import { RegisterParentDto, RegisterStaffDto } from "./dto/register.dto";
import { isValidPkceVerifier, pkceChallengeForVerifier } from "./mobile-pkce";

export const ALFIDA_UNITS = [
  { id: "0f3505db-ba0b-48e3-a500-2de9790bdd63", name: "TK Islam Terpadu Auladuna 1", slug: "tk-auladuna-1" },
  { id: "9fe99902-40e0-48dd-9275-d73531584365", name: "TK Islam Terpadu Auladuna 2", slug: "tk-auladuna-2" },
  { id: "dcaa14b2-b20c-416a-ba90-9367016ce295", name: "SD Islam Terpadu Iqra 1", slug: "sd-iqra-1" },
  { id: "c09fb430-b5d3-4ae2-a6cc-2220430da453", name: "SD Islam Terpadu Iqra 2", slug: "sd-iqra-2" },
  { id: "5edd8be0-86ac-406b-b23c-418b3e387528", name: "SD Islam Terpadu Iqra 3", slug: "sd-iqra-3" },
  { id: "a09edaf4-c656-4632-abf1-4c0a25150c98", name: "SMP Islam Terpadu Iqra", slug: "smp-iqra" },
  { id: "28225003-d1d3-4276-901c-f9a42a7cac69", name: "SMA Islam Terpadu Iqra", slug: "sma-iqra" },
  { id: "18d0d36c-aea5-4ba6-a89b-320f9a4f240d", name: "Pesantren Quran Alfida", slug: "pesantren-quran" },
  { id: "fed6e093-3fe7-46f7-b5c4-7b33e95ea8bb", name: "Kantor Pusat Yayasan", slug: "kantor-pusat" },
];

@Injectable()
export class AuthService {
  private secretKey: string;
  private readonly usedMobileAuthorizationCodes = new Map<string, number>();

  constructor(private readonly prisma: PrismaService) {
    this.secretKey =
      process.env.AUTH_SECRET ||
      process.env.BETTER_AUTH_SECRET ||
      "alfida-sso-secret-key-32-chars-long!!";
  }

  async getUnits() {
    return ALFIDA_UNITS;
  }

  async registerParent(dto: RegisterParentDto) {
    const email = dto.email.toLowerCase().trim();
    const existing = await this.prisma.user.findFirst({
      where: { email },
    });
    if (existing) {
      throw new BadRequestException("Email sudah terdaftar. Silakan masuk dengan akun Anda.");
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const userId = randomUUID();

    const user = await this.prisma.user.create({
      data: {
        id: userId,
        email,
        fullName: dto.fullName.trim(),
        phone: dto.phone.trim(),
        passwordHash,
        isActive: true, // Orang tua langsung aktif
        accounts: {
          create: {
            id: randomUUID(),
            providerId: "credential",
            accountId: userId,
            password: passwordHash,
          },
        },
        roles: {
          create: [
            { id: randomUUID(), app: "spmb", role: "orang_tua" },
            { id: randomUUID(), app: "siakad", role: "orang_tua" },
          ],
        },
      },
    });

    return {
      success: true,
      message: "Registrasi akun orang tua berhasil.",
      userId: user.id,
    };
  }

  async registerStaff(dto: RegisterStaffDto) {
    const email = dto.email.toLowerCase().trim();
    const existing = await this.prisma.user.findFirst({
      where: { email },
    });
    if (existing) {
      throw new BadRequestException("Email sudah terdaftar. Silakan gunakan email lain atau hubungi admin.");
    }
    if (!ALFIDA_UNITS.some((unit) => unit.id === dto.unitId)) {
      throw new BadRequestException("Unit kerja yang dipilih tidak valid.");
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const userId = randomUUID();
    const autoApprove = false;

    const rolesData =
      dto.role === "guru"
        ? [
            { id: randomUUID(), app: "simpeg", role: "pegawai", unitId: dto.unitId },
            { id: randomUUID(), app: "siakad", role: "guru", unitId: dto.unitId },
            { id: randomUUID(), app: "siyaum", role: "peserta" },
          ]
        : [
            { id: randomUUID(), app: "simpeg", role: "pegawai", unitId: dto.unitId },
            { id: randomUUID(), app: "siyaum", role: "peserta" },
          ];

    const user = await this.prisma.user.create({
      data: {
        id: userId,
        email,
        fullName: dto.fullName.trim(),
        phone: dto.phone.trim(),
        passwordHash,
        isActive: autoApprove,
        accounts: {
          create: {
            id: randomUUID(),
            providerId: "credential",
            accountId: userId,
            password: passwordHash,
          },
        },
        roles: {
          create: rolesData,
        },
      },
    });

    return {
      success: true,
      message: autoApprove
        ? "Registrasi berhasil. Akun Anda telah aktif dan dapat langsung digunakan untuk masuk."
        : "Registrasi berhasil. Akun Anda sedang menunggu verifikasi dan persetujuan Administrator Kepegawaian.",
      userId: user.id,
      isActive: autoApprove,
    };
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
      throw new UnauthorizedException("Akun Anda telah dinonaktifkan atau belum disetujui administrator.");
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

  async createMobileAuthorizationCode(userId: string, codeChallenge: string): Promise<string> {
    if (!/^[A-Za-z0-9_-]{43,128}$/.test(codeChallenge)) {
      throw new BadRequestException("PKCE code challenge tidak valid.");
    }
    const user = await this.getMe(userId);
    return createAuthToken(
      { sub: user.id, email: user.email, name: user.fullName, roles: user.roles },
      this.secretKey,
      { issuer: "https://auth.alfida.or.id", audience: `mobile:${codeChallenge}`, expiresIn: "60s" },
    );
  }

  async exchangeMobileAuthorizationCode(code: string, verifier: string) {
    if (!code || !isValidPkceVerifier(verifier)) {
      throw new UnauthorizedException("Kode otorisasi mobile tidak valid.");
    }
    const payload = await verifyAuthToken(code, this.secretKey, { issuer: "https://auth.alfida.or.id" });
    const audience = typeof payload?.aud === "string" ? payload.aud : "";
    const expectedChallenge = audience.startsWith("mobile:") ? audience.slice("mobile:".length) : "";
    if (!payload?.sub || !expectedChallenge || pkceChallengeForVerifier(verifier) !== expectedChallenge) {
      throw new UnauthorizedException("Kode otorisasi mobile tidak valid.");
    }

    const codeHash = createHash("sha256").update(code).digest("hex");
    const now = Date.now();
    for (const [hash, expiry] of this.usedMobileAuthorizationCodes) {
      if (expiry <= now) this.usedMobileAuthorizationCodes.delete(hash);
    }
    if (this.usedMobileAuthorizationCodes.has(codeHash)) {
      throw new UnauthorizedException("Kode otorisasi mobile sudah digunakan.");
    }
    this.usedMobileAuthorizationCodes.set(codeHash, now + 60_000);

    const user = await this.getMe(payload.sub);
    return {
      token: await this.createJwtToken(user, user.roles),
      user,
      expiresAt: new Date(now + 7 * 24 * 60 * 60 * 1000),
    };
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
