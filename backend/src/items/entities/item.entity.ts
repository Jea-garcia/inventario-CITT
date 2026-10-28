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
  codigoSerie: string; // Ej: CITT-LAP-001

  @Column({ type: 'varchar', length: 100 })
  categoria: string; // Ej: Laptops, Sensores, Herramientas

  @Column({ type: 'enum', enum: ItemStatus, default: ItemStatus.DISPONIBLE })
  estado: ItemStatus;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  ubicacion: string; // Ej: Pañol CITT, Sala 102

  @CreateDateColumn()
  fechaCreacion: Date;

  @UpdateDateColumn()
  fechaActualizacion: Date;
}