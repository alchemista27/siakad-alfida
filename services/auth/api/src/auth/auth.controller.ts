import {
  Controller,
  Post,
  Patch,
  Get,
  Body,
  Res,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
  BadRequestException,
} from "@nestjs/common";
import { Response, Request } from "express";
import { AuthService } from "./auth.service";
import {
  ServiceJwtAuthGuard,
  CurrentUser,
  ALFIDA_SESSION_COOKIE,
} from "@alfida/auth-sdk";
import { RegisterParentDto, RegisterStaffDto } from "./dto/register.dto";
import {
  ChangeOwnPasswordDto,
  parseChangeOwnPassword,
  parseUpdateOwnProfile,
  UpdateOwnProfileDto,
} from "./dto/profile.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private writeSessionCookie(res: Response, token: string, expiresAt: Date) {
    const isProd = process.env.NODE_ENV === "production";
    const cookieDomain = process.env.COOKIE_DOMAIN || (isProd ? ".alfida.or.id" : undefined);
    res.cookie(ALFIDA_SESSION_COOKIE, token, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      domain: cookieDomain,
      expires: expiresAt,
      path: "/",
    });
  }

  @Get("units")
  async getUnits() {
    return this.authService.getUnits();
  }

  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  async registerParent(@Body() body: RegisterParentDto) {
    return this.authService.registerParent(body);
  }

  @Post("register-staff")
  @HttpCode(HttpStatus.CREATED)
  async registerStaff(@Body() body: RegisterStaffDto) {
    return this.authService.registerStaff(body);
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() body: { email: string; password: string },
    @Res({ passthrough: true }) res: Response
  ) {
    const result = await this.authService.login(body.email, body.password);

    this.writeSessionCookie(res, result.token, result.expiresAt);

    return {
      success: true,
      user: result.user,
      token: result.token,
    };
  }

  @Post("logout")
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    const sessionToken = req.cookies?.[ALFIDA_SESSION_COOKIE];
    if (sessionToken) {
      await this.authService.logout(sessionToken);
    }

    const isProd = process.env.NODE_ENV === "production";
    const cookieDomain = process.env.COOKIE_DOMAIN || (isProd ? ".alfida.or.id" : undefined);

    res.clearCookie(ALFIDA_SESSION_COOKIE, {
      domain: cookieDomain,
      path: "/",
    });

    return {
      success: true,
      message: "Berhasil keluar dari sistem",
    };
  }

  @Get("mobile/authorize")
  @UseGuards(ServiceJwtAuthGuard)
  async authorizeMobile(
    @CurrentUser("id") userId: string,
    @Query("redirect_uri") redirectUri: string,
    @Query("state") state: string,
    @Query("code_challenge") codeChallenge: string,
    @Res() res: Response,
  ) {
    if (redirectUri !== "simpeg-absensi://auth") {
      throw new BadRequestException("Redirect URI aplikasi mobile tidak diizinkan.");
    }
    if (!state || !codeChallenge) {
      throw new BadRequestException("State dan PKCE code challenge wajib diisi.");
    }
    const code = await this.authService.createMobileAuthorizationCode(userId, codeChallenge);
    const callback = new URL(redirectUri);
    callback.searchParams.set("code", code);
    callback.searchParams.set("state", state);
    return res.redirect(HttpStatus.FOUND, callback.toString());
  }

  @Post("mobile/token")
  @HttpCode(HttpStatus.OK)
  async exchangeMobileCode(@Body() body: { code: string; code_verifier: string }) {
    return this.authService.exchangeMobileAuthorizationCode(body.code, body.code_verifier);
  }

  @Patch("me")
  @UseGuards(ServiceJwtAuthGuard)
  async updateMyProfile(
    @CurrentUser("id") userId: string,
    @Body() body: unknown,
    @Res({ passthrough: true }) res: Response,
  ) {
    let dto: UpdateOwnProfileDto;
    try {
      dto = parseUpdateOwnProfile(body);
    } catch (error) {
      throw new BadRequestException(error instanceof Error ? error.message : "Data profil tidak valid.");
    }
    const user = await this.authService.updateOwnProfile(userId, dto);
    const token = await this.authService.createJwtToken(user, user.roles);
    this.writeSessionCookie(res, token, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
    return { success: true, user, message: "Profil berhasil disimpan." };
  }

  @Post("me/password")
  @UseGuards(ServiceJwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async changeMyPassword(
    @CurrentUser("id") userId: string,
    @Body() body: unknown,
    @Res({ passthrough: true }) res: Response,
  ) {
    let dto: ChangeOwnPasswordDto;
    try {
      dto = parseChangeOwnPassword(body);
    } catch (error) {
      throw new BadRequestException(error instanceof Error ? error.message : "Data password tidak valid.");
    }
    const result = await this.authService.changeOwnPassword(userId, dto);
    const isProd = process.env.NODE_ENV === "production";
    const cookieDomain = process.env.COOKIE_DOMAIN || (isProd ? ".alfida.or.id" : undefined);
    res.clearCookie(ALFIDA_SESSION_COOKIE, { domain: cookieDomain, path: "/" });
    return result;
  }

  @Get("me")
  @UseGuards(ServiceJwtAuthGuard)
  async getMe(@CurrentUser("id") userId: string) {
    const user = await this.authService.getMe(userId);
    return {
      success: true,
      user,
    };
  }
}
