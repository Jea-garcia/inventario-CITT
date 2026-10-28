import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { Item } from './item.entity';

export enum SolicitudState {
  PENDIENTE = 'PENDIENTE',
  APROBADA = 'APROBADA',
  RECHAZADA = 'RECHAZADA',
}

@Entity('solicitudes')
export class Solicitud {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Item, { onDelete: 'CASCADE' })
  item: Item;

  @Column({ type: 'varchar' })
  solicitanteNombre: string;

  @Column({ type: 'varchar' })
  solicitanteEmail: string;

  @Column({ type: 'enum', enum: SolicitudState, default: SolicitudState.PENDIENTE })
  estado: SolicitudState;

  @Column({ type: 'varchar', nullable: true })
  aprobadoPor: string;

  @CreateDateColumn()
  fechaSolicitud: Date;
}