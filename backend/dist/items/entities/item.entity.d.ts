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
    esConsumible: boolean;
    cantidadGramos: number;
    stockMinimoGramos: number;
    prestadoA: string;
    fechaPrestamo: Date;
    fechaCreacion: Date;
    fechaActualizacion: Date;
}
