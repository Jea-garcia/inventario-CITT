import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import type { JwtPayload } from './jwt-auth.guard';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(email: string, pass: string) {
    const user = await this.usersService.validateCredentials(email ?? '', pass ?? '');

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      nombre: user.nombre,
      rol: user.rol,
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
        // Si es true, el frontend debe obligar a cambiar la clave temporal
        debeCambiarPassword: user.debeCambiarPassword,
      },
    };
  }

  me(userId: string) {
    return this.usersService.getPublicById(userId);
  }

  async changePassword(userId: string, actual: string, nueva: string) {
    await this.usersService.changeOwnPassword(userId, actual, nueva);
    return { message: 'Contraseña actualizada correctamente' };
  }
}