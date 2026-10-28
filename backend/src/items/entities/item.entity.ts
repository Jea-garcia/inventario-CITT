import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum ItemStatus {
  DISPONIBLE = 'DISPONIBLE',
  PRESTADO = 'PRESTADO',
  MANTENIMIENTO = 'MANTENIMIENTO',
  DEBAJA = 'DEBAJA',
}

@Entity('items')
export class Item {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  codigoSerie: string;

  @Column({ type: 'varchar', length: 100 })
  categoria: string;

  @Column({ type: 'enum', enum: ItemStatus, default: ItemStatus.DISPONIBLE })
  estado: ItemStatus;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  ubicacion: string;

  // Nuevos campos para la gestión de préstamos
  @Column({ type: 'varchar', length: 150, nullable: true })
  prestadoA: string; // Nombre y Rut/Correo del Alumno o Docente

  @Column({ type: 'timestamp', nullable: true })
  fechaPrestamo: Date;

  @CreateDateColumn()
  fechaCreacion: Date;

  @UpdateDateColumn()
  fechaActualizacion: Date;
}