const API_URL = 'http://localhost:3000';

export interface Item {
  id: string;
  nombre: string;
  codigoSerie: string;
  categoria: string;
  estado: 'DISPONIBLE' | 'PRESTADO' | 'MANTENIMIENTO' | 'DEBAJA';
  descripcion?: string;
  ubicacion?: string;
  fechaCreacion: string;
}

export const getItems = async (): Promise<Item[]> => {
  const res = await fetch(`${API_URL}/items`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Error al obtener los ítems');
  return res.json();
};

export const createItem = async (item: Omit<Item, 'id' | 'fechaCreacion'>): Promise<Item> => {
  const res = await fetch(`${API_URL}/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });
  if (!res.ok) throw new Error('Error al crear el ítem');
  return res.json();
};