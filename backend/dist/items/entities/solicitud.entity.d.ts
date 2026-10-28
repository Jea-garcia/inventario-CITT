import { Item } from './item.entity';
export declare enum SolicitudState {
    PENDIENTE = "PENDIENTE",
    APROBADA = "APROBADA",
    RECHAZADA = "RECHAZADA"
}
export declare class Solicitud {
    id: string;
    item: Item;
    solicitanteNombre: string;
    solicitanteEmail: string;
    estado: SolicitudState;
    aprobadoPor: string;
    fechaSolicitud: Date;
}
