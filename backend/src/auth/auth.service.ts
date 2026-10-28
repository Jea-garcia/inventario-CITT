import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  // Base de datos temporal de usuarios de demostración CITT
  private mockUsers = [
    {
      email: 'admin@duoc.cl',
      password: 'admin',
      nombre: 'Administrador CITT',
      rol: UserRole.ADMIN,
    },
    {
      email: 'lider@duoc.cl',
      password: 'lider',
      nombre: 'Alumno Líder Pañol',
      rol: UserRole.ALUMNO_LIDER,
    },
    {
      email: 'alumno@duoc.cl',
      password: 'alumno',
      nombre: 'Estudiante Duoc UC',
      rol: UserRole.USUARIO_GLOBAL,
    },
  ];

  async login(email: string, pass: string) {
    const user = this.mockUsers.find((u) => u.email === email && u.password === pass);

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
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
}