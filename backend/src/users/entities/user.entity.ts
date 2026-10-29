import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum UserRole {
  ADMIN = 'ADMINISTRADOR',
  ALUMNO_LIDER = 'ALUMNO_LIDER',
  USUARIO_GLOBAL = 'USUARIO_GLOBAL',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  email: string;

  @Column({ type: 'varchar' })
  passwordHash: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USUARIO_GLOBAL })
  rol: UserRole;

  // Las cuentas no se eliminan: se desactivan para conservar el historial
  @Column({ type: 'boolean', default: true })
  activo: boolean;

  // true cuando el usuario tiene una clave temporal y debe cambiarla al ingresar
  @Column({ type: 'boolean', default: false })
  debeCambiarPassword: boolean;

  @CreateDateColumn()
  fechaCreacion: Date;
}