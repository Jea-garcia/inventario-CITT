import { ItemStatus } from '../entities/item.entity';

export class CreateItemDto {
  nombre: string;
  codigoSerie: string;
  categoria: string;
  estado?: ItemStatus;
  descripcion?: string;
  ubicacion?: string;
}