import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {

  constructor(private prisma: PrismaService) {


  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    let token = '';

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else {
      // Proxy Next.js (seperti ekspor Excel) tidak membawa header Authorization
      // tapi membawa cookie. Coba fallback ekstrak token dari Cookie.
      const cookieHeader = request.headers.cookie || '';
      const match = cookieHeader.match(/(?:^|;\s*)(?:better-auth\.session_token|__Secure-better-auth\.session_token)=([^;]+)/);
      if (match) {
        token = decodeURIComponent(match[1]);
      } else {
        throw new UnauthorizedException('Missing or invalid Authorization header');
      }
    }

    // Better Auth sends signed cookies in the format: <token>.<signature>
    // We only need the raw <token> to query the Session table in the database
    const signatureStartPos = token.lastIndexOf(".");
    if (signatureStartPos > 0) {
      token = token.substring(0, signatureStartPos);
    }

    // Verify token online with Prisma Session table (Better Auth)
    const session = await this.prisma.session.findUnique({
      where: { token },
      include: {
        user: {
          include: { 
            roles: { include: { unit: true } } 
          }
        }
      }
    });

    if (!session || session.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    if (!session.user || !session.user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    // Attach user to request
    request.user = session.user;
    return true;
  }
}
