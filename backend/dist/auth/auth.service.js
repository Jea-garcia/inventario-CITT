"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const user_entity_1 = require("../users/entities/user.entity");
let AuthService = class AuthService {
    mockUsers = [
        {
            email: 'admin@duoc.cl',
            password: 'admin',
            nombre: 'Administrador CITT',
            rol: user_entity_1.UserRole.ADMIN,
        },
        {
            email: 'lider@duoc.cl',
            password: 'lider',
            nombre: 'Alumno Líder Pañol',
            rol: user_entity_1.UserRole.ALUMNO_LIDER,
        },
        {
            email: 'alumno@duoc.cl',
            password: 'alumno',
            nombre: 'Estudiante Duoc UC',
            rol: user_entity_1.UserRole.USUARIO_GLOBAL,
        },
    ];
    async login(email, pass) {
        const user = this.mockUsers.find((u) => u.email === email && u.password === pass);
        if (!user) {
            throw new common_1.UnauthorizedException('Credenciales inválidas');
        }
        return {
            access_token: `jwt-token-citt-${user.rol.toLowerCase()}`,
            user: {
                nombre: user.nombre,
                email: user.email,
                rol: user.rol,
            },
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)()
], AuthService);
//# sourceMappingURL=auth.service.js.map