export declare enum ItemStatus {
    DISPONIBLE = "DISPONIBLE",
    PRESTADO = "PRESTADO",
    MANTENIMIENTO = "MANTENIMIENTO",
    DEBAJA = "DEBAJA"
}
export declare class Item {
    id: string;
    nombre: string;
    codigoSerie: string;
    categoria: string;
    estado: ItemStatus;
    descripcion: string;
    ubicacion: string;
    fechaCreacion: Date;
    fechaActualizacion: Date;
}
