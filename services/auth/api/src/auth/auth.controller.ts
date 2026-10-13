import {
  Controller,
  Post,
  Get,
  Body,
  Res,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { Response, Request } from "express";
import { AuthService } from "./auth.service";
import {
  ServiceJwtAuthGuard,
  CurrentUser,
  ALFIDA_SESSION_COOKIE,
} from "@alfida/auth-sdk";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() body: { email: string; password: string },
    @Res({ passthrough: true }) res: Response
  ) {
    const result = await this.authService.login(body.email, body.password);

    const isProd = process.env.NODE_ENV === "production";
    const cookieDomain = process.env.COOKIE_DOMAIN || (isProd ? ".alfida.or.id" : undefined);

    // Pasang cookie sesi SSO yang berlaku lintas subdomain
    res.cookie(ALFIDA_SESSION_COOKIE, result.token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "lax" : "lax",
      domain: cookieDomain,
      expires: result.expiresAt,
      path: "/",
    });

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
