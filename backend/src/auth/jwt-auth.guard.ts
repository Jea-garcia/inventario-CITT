import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '../users/entities/user.entity';

export interface JwtPayload {
  sub: string;
  email: string;
  nombre: string;
  rol: UserRole;
}

export interface AuthenticatedRequest {
  headers: Record<string, string | string[] | undefined>;
  user?: JwtPayload;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const raw = req.headers['authorization'];
    const header = Array.isArray(raw) ? raw[0] : raw;
    const [tipo, token] = (header ?? '').split(' ');

    if (tipo !== 'Bearer' || !token) {
      throw new UnauthorizedException('Falta el token de autenticación');
    }

    try {
      req.user = await this.jwtService.verifyAsync<JwtPayload>(token);
      return true;
    } catch {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
}