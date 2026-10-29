import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import type { AuthenticatedRequest } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { email: string; pass: string }) {
    return this.authService.login(body.email, body.pass);
  }

  // Perfil del usuario autenticado
  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: AuthenticatedRequest) {
    return this.authService.me(req.user!.sub);
  }

  // Cada usuario cambia su propia contraseña (obligatorio tras una clave temporal)
  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  changePassword(@Req() req: AuthenticatedRequest, @Body() body: { actual: string; nueva: string }) {
    return this.authService.changePassword(req.user!.sub, body.actual, body.nueva);
  }
}