import { UsersService } from './users.service';
import { UserRole } from './entities/user.entity';
import type { AuthenticatedRequest } from '../auth/jwt-auth.guard';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(): Promise<import("./users.service").PublicUser[]>;
    create(body: {
        nombre?: string;
        email?: string;
        rol?: UserRole;
    }): Promise<{
        user: import("./users.service").PublicUser;
        passwordTemporal: string;
    }>;
    update(req: AuthenticatedRequest, id: string, body: {
        nombre?: string;
        email?: string;
        rol?: UserRole;
        activo?: boolean;
    }): Promise<import("./users.service").PublicUser>;
    resetPassword(id: string): Promise<{
        user: import("./users.service").PublicUser;
        passwordTemporal: string;
    }>;
}
