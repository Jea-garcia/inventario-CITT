import { CanActivate, ExecutionContext } from '@nestjs/common';
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
export declare class JwtAuthGuard implements CanActivate {
    private readonly jwtService;
    constructor(jwtService: JwtService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
