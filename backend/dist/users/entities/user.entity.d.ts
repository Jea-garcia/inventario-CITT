export declare enum UserRole {
    ADMIN = "ADMINISTRADOR",
    ALUMNO_LIDER = "ALUMNO_LIDER",
    USUARIO_GLOBAL = "USUARIO_GLOBAL"
}
export declare class User {
    id: string;
    nombre: string;
    email: string;
    passwordHash: string;
    rol: UserRole;
    fechaCreacion: Date;
}
