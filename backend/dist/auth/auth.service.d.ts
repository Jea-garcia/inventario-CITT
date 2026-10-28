import { UserRole } from '../users/entities/user.entity';
export declare class AuthService {
    private mockUsers;
    login(email: string, pass: string): Promise<{
        access_token: string;
        user: {
            nombre: string;
            email: string;
            rol: UserRole;
        };
    }>;
}
