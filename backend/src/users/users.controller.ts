import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserRole } from './entities/user.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthenticatedRequest } from '../auth/jwt-auth.guard';
import { Roles, RolesGuard } from '../auth/roles.guard';

// Todo este controlador es exclusivo del Administrador
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  // Devuelve el usuario creado y su contraseña temporal (se muestra una sola vez)
  @Post()
  create(@Body() body: { nombre?: string; email?: string; rol?: UserRole }) {
    return this.usersService.create(body);
  }

  // Editar nombre, correo y rol, o activar / desactivar la cuenta
  @Patch(':id')
  update(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: { nombre?: string; email?: string; rol?: UserRole; activo?: boolean },
  ) {
    return this.usersService.update(req.user!.sub, id, body);
  }

  // Genera una nueva contraseña temporal (se muestra una sola vez)
  @Post(':id/reset-password')
  resetPassword(@Param('id') id: string) {
    return this.usersService.resetPassword(id);
  }
}