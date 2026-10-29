import { UsersService } from './users.service';
import { UserRole } from './entities/user.entity';
import type { AuthenticatedRequest } from '../auth/jwt-auth.guard';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(): any;
    create(body: {
        nombre?: string;
        email?: string;
        rol?: UserRole;
    }): any;
    update(req: AuthenticatedRequest, id: string, body: {
        nombre?: string;
        email?: string;
        rol?: UserRole;
        activo?: boolean;
    }): any;
    resetPassword(id: string): any;
}
