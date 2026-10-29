import { OnModuleInit } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
export type PublicUser = Omit<User, 'passwordHash'>;
export declare class UsersService implements OnModuleInit {
    private readonly repo;
    private readonly logger;
    constructor(repo: Repository<User>);
    onModuleInit(): Promise<void>;
    findAll(): Promise<PublicUser[]>;
    getPublicById(id: string): Promise<PublicUser>;
    create(data: {
        nombre?: string;
        email?: string;
        rol?: UserRole;
    }): Promise<{
        user: PublicUser;
        passwordTemporal: string;
    }>;
    update(actorId: string, id: string, data: {
        nombre?: string;
        email?: string;
        rol?: UserRole;
        activo?: boolean;
    }): Promise<PublicUser>;
    resetPassword(id: string): Promise<{
        user: PublicUser;
        passwordTemporal: string;
    }>;
    validateCredentials(email: string, password: string): Promise<User | null>;
    changeOwnPassword(userId: string, actual: string, nueva: string): Promise<void>;
    private findByIdOrFail;
    private parseRol;
    private toPublic;
}
