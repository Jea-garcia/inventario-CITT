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

  @CreateDateColumn()
  fechaCreacion: Date;
}