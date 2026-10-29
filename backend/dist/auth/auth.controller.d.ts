import { AuthService } from './auth.service';
import type { AuthenticatedRequest } from './jwt-auth.guard';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(body: {
        email: string;
        pass: string;
    }): Promise<{
        access_token: string;
        user: {
            id: string;
            nombre: string;
            email: string;
            rol: import("../users/entities/user.entity").UserRole;
            debeCambiarPassword: boolean;
        };
    }>;
    me(req: AuthenticatedRequest): Promise<import("../users/users.service").PublicUser>;
    changePassword(req: AuthenticatedRequest, body: {
        actual: string;
        nueva: string;
    }): Promise<{
        message: string;
    }>;
}
