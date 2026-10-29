import { CanActivate, ExecutionContext, ForbiddenException, Injectable, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../users/entities/user.entity';
import type { JwtPayload } from './jwt-auth.guard';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Si la ruta no declara roles, cualquier usuario autenticado puede entrar
    if (!roles || roles.length === 0) return true;

    const req = context.switchToHttp().getRequest<{ user?: JwtPayload }>();
    if (!req.user || !roles.includes(req.user.rol)) {
      throw new ForbiddenException('No tienes permisos para realizar esta acción');
    }
    return true;
  }
}