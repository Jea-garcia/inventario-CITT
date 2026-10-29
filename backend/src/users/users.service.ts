import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { randomInt } from 'crypto';
import { User, UserRole } from './entities/user.entity';

export type PublicUser = Omit<User, 'passwordHash'>;

const SALT_ROUNDS = 10;
const MIN_PASSWORD_LENGTH = 8;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Sin caracteres ambiguos (0/O, 1/l/I) para que la clave temporal sea fácil de dictar
const TEMP_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';

function generarPasswordTemporal(length = 10): string {
  let out = '';
  for (let i = 0; i < length; i++) {
    out += TEMP_ALPHABET[randomInt(TEMP_ALPHABET.length)];
  }
  return out;
}

@Injectable()
export class UsersService implements OnModuleInit {
  private readonly logger = new Logger(UsersService.name);

  constructor(@InjectRepository(User) private readonly repo: Repository<User>) {}

  // Si la tabla está vacía, crea las 3 cuentas de demostración (con contraseña cifrada)
  async onModuleInit() {
    const total = await this.repo.count();
    if (total > 0) return;

    const demo = [
      { nombre: 'Administrador CITT', email: 'admin@duoc.cl', password: 'admin', rol: UserRole.ADMIN },
      { nombre: 'Alumno Líder Pañol', email: 'lider@duoc.cl', password: 'lider', rol: UserRole.ALUMNO_LIDER },
      { nombre: 'Estudiante Duoc UC', email: 'alumno@duoc.cl', password: 'alumno', rol: UserRole.USUARIO_GLOBAL },
    ];

    for (const d of demo) {
      await this.repo.save(
        this.repo.create({
          nombre: d.nombre,
          email: d.email,
          rol: d.rol,
          passwordHash: await bcrypt.hash(d.password, SALT_ROUNDS),
          activo: true,
          debeCambiarPassword: false,
        }),
      );
    }
    this.logger.warn('Se crearon las cuentas de demostración. Cambia sus contraseñas antes de usar el sistema en producción.');
  }

  // ───────────── Consultas ─────────────

  async findAll(): Promise<PublicUser[]> {
    const users = await this.repo.find({ order: { fechaCreacion: 'ASC' } });
    return users.map((u) => this.toPublic(u));
  }

  async getPublicById(id: string): Promise<PublicUser> {
    return this.toPublic(await this.findByIdOrFail(id));
  }

  // ───────────── Gestión (solo Administrador) ─────────────

  async create(data: { nombre?: string; email?: string; rol?: UserRole }) {
    const nombre = (data.nombre ?? '').trim();
    const email = (data.email ?? '').trim().toLowerCase();

    if (!nombre) throw new BadRequestException('El nombre es obligatorio');
    if (!EMAIL_REGEX.test(email)) throw new BadRequestException('El correo no es válido');
    const rol = this.parseRol(data.rol);

    if (await this.repo.findOne({ where: { email } })) {
      throw new ConflictException('Ya existe un usuario con ese correo');
    }

    // El administrador nunca elige la contraseña: se genera una temporal
    const passwordTemporal = generarPasswordTemporal();
    const user = await this.repo.save(
      this.repo.create({
        nombre,
        email,
        rol,
        passwordHash: await bcrypt.hash(passwordTemporal, SALT_ROUNDS),
        activo: true,
        debeCambiarPassword: true,
      }),
    );

    return { user: this.toPublic(user), passwordTemporal };
  }

  async update(
    actorId: string,
    id: string,
    data: { nombre?: string; email?: string; rol?: UserRole; activo?: boolean },
  ): Promise<PublicUser> {
    const user = await this.findByIdOrFail(id);

    if (data.nombre !== undefined) {
      const nombre = data.nombre.trim();
      if (!nombre) throw new BadRequestException('El nombre no puede estar vacío');
      user.nombre = nombre;
    }

    if (data.email !== undefined) {
      const email = data.email.trim().toLowerCase();
      if (!EMAIL_REGEX.test(email)) throw new BadRequestException('El correo no es válido');
      if (email !== user.email) {
        if (await this.repo.findOne({ where: { email } })) {
          throw new ConflictException('Ya existe un usuario con ese correo');
        }
        user.email = email;
      }
    }

    const nuevoRol = data.rol !== undefined ? this.parseRol(data.rol) : user.rol;
    const nuevoActivo = data.activo !== undefined ? Boolean(data.activo) : user.activo;

    // Protección: no dejar el sistema sin administradores activos
    const dejaDeSerAdminActivo = user.rol === UserRole.ADMIN && user.activo && (nuevoRol !== UserRole.ADMIN || !nuevoActivo);
    if (dejaDeSerAdminActivo) {
      if (user.id === actorId) {
        throw new BadRequestException('No puedes quitarte tu propio rol de administrador ni desactivar tu propia cuenta');
      }
      const adminsActivos = await this.repo.count({ where: { rol: UserRole.ADMIN, activo: true } });
      if (adminsActivos <= 1) {
        throw new BadRequestException('Debe existir al menos un administrador activo');
      }
    }

    user.rol = nuevoRol;
    user.activo = nuevoActivo;

    return this.toPublic(await this.repo.save(user));
  }

  async resetPassword(id: string) {
    const user = await this.findByIdOrFail(id);
    const passwordTemporal = generarPasswordTemporal();

    user.passwordHash = await bcrypt.hash(passwordTemporal, SALT_ROUNDS);
    user.debeCambiarPassword = true;
    await this.repo.save(user);

    return { user: this.toPublic(user), passwordTemporal };
  }

  // ───────────── Autenticación ─────────────

  async validateCredentials(email: string, password: string): Promise<User | null> {
    const user = await this.repo.findOne({ where: { email: email.trim().toLowerCase() } });
    if (!user || !user.activo) return null;
    const ok = await bcrypt.compare(password, user.passwordHash);
    return ok ? user : null;
  }

  async changeOwnPassword(userId: string, actual: string, nueva: string) {
    const user = await this.findByIdOrFail(userId);

    if (!(await bcrypt.compare(actual ?? '', user.passwordHash))) {
      throw new BadRequestException('La contraseña actual no es correcta');
    }
    if (!nueva || nueva.length < MIN_PASSWORD_LENGTH) {
      throw new BadRequestException(`La nueva contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`);
    }
    if (nueva === actual) {
      throw new BadRequestException('La nueva contraseña debe ser distinta a la actual');
    }

    user.passwordHash = await bcrypt.hash(nueva, SALT_ROUNDS);
    user.debeCambiarPassword = false;
    await this.repo.save(user);
  }

  // ───────────── Utilidades ─────────────

  private async findByIdOrFail(id: string): Promise<User> {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  private parseRol(rol: unknown): UserRole {
    if (typeof rol === 'string' && (Object.values(UserRole) as string[]).includes(rol)) {
      return rol as UserRole;
    }
    throw new BadRequestException('Rol no válido (ADMINISTRADOR, ALUMNO_LIDER o USUARIO_GLOBAL)');
  }

  private toPublic(user: User): PublicUser {
    const { passwordHash, ...rest } = user;
    return rest;
  }
}