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
  ubicacion: string; // Casillero (ej: A-12, Rack 2 o Sin Casillero)

  // Campos para Consumibles (Filamento 3D)
  @Column({ type: 'boolean', default: false })
  esConsumible: boolean;

  @Column({ type: 'float', default: 0 })
  cantidadGramos: number; // Stock en gramos (ej: 10.000 g = 10 kg)

  @Column({ type: 'float', default: 1000 })
  stockMinimoGramos: number; // Alerta si baja de esto (ej: 1.000 g = 1 kg)

  // Campos para Préstamos
  @Column({ type: 'varchar', length: 150, nullable: true })
  prestadoA: string;

  @Column({ type: 'timestamp', nullable: true })
  fechaPrestamo: Date;

  @CreateDateColumn()
  fechaCreacion: Date;

  @UpdateDateColumn()
  fechaActualizacion: Date;
}