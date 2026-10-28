'use client';

import { useEffect, useState } from 'react';
import { getItems, createItem, Item } from '@/services/api';

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    nombre: '',
    codigoSerie: '',
    categoria: '',
    ubicacion: '',
    descripcion: '',
  });

  const loadItems = async () => {
    try {
      const data = await getItems();
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre || !form.codigoSerie || !form.categoria) return;
    try {
      await createItem(form);
      setForm({ nombre: '', codigoSerie: '', categoria: '', ubicacion: '', descripcion: '' });
      loadItems();
    } catch (err) {
      alert('Error guardando el activo');
    }
  };

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="border-b border-slate-700 pb-4">
          <h1 className="text-3xl font-bold text-blue-400">Inventario CITT - Duoc UC</h1>
          <p className="text-slate-400">Gestión de activos, equipos y pañol</p>
        </header>

        {/* Formulario de Registro */}
        <form onSubmit={handleSubmit} className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-4">
          <h2 className="text-xl font-semibold text-slate-200">Registrar Nuevo Activo</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Nombre (ej: Laptop Dell)"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              className="p-2 rounded bg-slate-900 border border-slate-700 text-white"
              required
            />
            <input
              type="text"
              placeholder="Código Serie (ej: CITT-LAP-001)"
              value={form.codigoSerie}
              onChange={(e) => setForm({ ...form, codigoSerie: e.target.value })}
              className="p-2 rounded bg-slate-900 border border-slate-700 text-white"
              required
            />
            <input
              type="text"
              placeholder="Categoría (ej: Computadores)"
              value={form.categoria}
              onChange={(e) => setForm({ ...form, categoria: e.target.value })}
              className="p-2 rounded bg-slate-900 border border-slate-700 text-white"
              required
            />
            <input
              type="text"
              placeholder="Ubicación (ej: Pañol 1)"
              value={form.ubicacion}
              onChange={(e) => setForm({ ...form, ubicacion: e.target.value })}
              className="p-2 rounded bg-slate-900 border border-slate-700 text-white"
            />
            <input
              type="text"
              placeholder="Descripción breve"
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              className="p-2 rounded bg-slate-900 border border-slate-700 text-white md:col-span-2"
            />
          </div>
          <button type="submit" className="bg-blue-600 hover:bg-blue-500 font-semibold px-4 py-2 rounded">
            Guardar en PostgreSQL
          </button>
        </form>

        {/* Tabla de Resultados */}
        <section className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <h2 className="text-xl font-semibold mb-4 text-slate-200">Activos en Base de Datos</h2>
          {loading ? (
            <p className="text-slate-400">Cargando datos...</p>
          ) : items.length === 0 ? (
            <p className="text-slate-400">No hay activos registrados aún.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-400">
                    <th className="p-2">Código</th>
                    <th className="p-2">Nombre</th>
                    <th className="p-2">Categoría</th>
                    <th className="p-2">Ubicación</th>
                    <th className="p-2">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                      <td className="p-2 font-mono text-sm text-blue-300">{item.codigoSerie}</td>
                      <td className="p-2 font-medium">{item.nombre}</td>
                      <td className="p-2 text-slate-300">{item.categoria}</td>
                      <td className="p-2 text-slate-400">{item.ubicacion || 'N/A'}</td>
                      <td className="p-2">
                        <span className="px-2 py-1 text-xs rounded bg-emerald-900/60 text-emerald-300 border border-emerald-700">
                          {item.estado}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}