import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
export declare class AuthService {
    private readonly usersService;
    private readonly jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
    login(email: string, pass: string): Promise<{
        access_token: string;
        user: {
            id: string;
            nombre: string;
            email: string;
            rol: import("../users/entities/user.entity").UserRole;
            debeCambiarPassword: boolean;
        };
    }>;
    me(userId: string): Promise<import("../users/users.service").PublicUser>;
    changePassword(userId: string, actual: string, nueva: string): Promise<{
        message: string;
    }>;
}
