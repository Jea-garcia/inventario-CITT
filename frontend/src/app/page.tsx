'use client';

import { useEffect, useState } from 'react';
import { getItems, createItem, updateItem, deleteItem, Item } from '@/services/api';

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtros de búsqueda
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('TODOS');

  // Formularios y Modales
  const [form, setForm] = useState<{
    nombre: string;
    codigoSerie: string;
    categoria: string;
    ubicacion: string;
    estado: Item['estado'];
    descripcion: string;
  }>({
    nombre: '',
    codigoSerie: '',
    categoria: '',
    ubicacion: '',
    estado: 'DISPONIBLE',
    descripcion: '',
  });

  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [loanItem, setLoanItem] = useState<Item | null>(null);
  const [prestadoAInput, setPrestadoAInput] = useState('');

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
      setForm({
        nombre: '',
        codigoSerie: '',
        categoria: '',
        ubicacion: '',
        estado: 'DISPONIBLE',
        descripcion: '',
      });
      loadItems();
    } catch (err) {
      alert('Error guardando el activo');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este activo?')) return;
    try {
      await deleteItem(id);
      loadItems();
    } catch (err) {
      alert('Error al eliminar el activo');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    try {
      await updateItem(editingItem.id, editingItem);
      setEditingItem(null);
      loadItems();
    } catch (err) {
      alert('Error al actualizar el activo');
    }
  };

  // Registrar Préstamo
  const handleConfirmLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loanItem || !prestadoAInput.trim()) return;
    try {
      await updateItem(loanItem.id, {
        estado: 'PRESTADO',
        prestadoA: prestadoAInput,
        fechaPrestamo: new Date().toISOString(),
      });
      setLoanItem(null);
      setPrestadoAInput('');
      loadItems();
    } catch (err) {
      alert('Error al registrar el préstamo');
    }
  };

  // Registrar Devolución
  const handleReturnLoan = async (item: Item) => {
    if (!confirm(`¿Confirmar devolución del activo ${item.nombre}?`)) return;
    try {
      await updateItem(item.id, {
        estado: 'DISPONIBLE',
        prestadoA: '',
      });
      loadItems();
    } catch (err) {
      alert('Error al procesar la devolución');
    }
  };

  // Exportar inventario a formato CSV
  const handleExportCSV = () => {
    if (filteredItems.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    const headers = ['Codigo Serie', 'Nombre', 'Categoria', 'Ubicacion', 'Estado', 'Asignado A', 'Descripcion'];
    const rows = filteredItems.map((item) => [
      `"${item.codigoSerie}"`,
      `"${item.nombre}"`,
      `"${item.categoria}"`,
      `"${item.ubicacion || 'N/A'}"`,
      `"${item.estado}"`,
      `"${item.prestadoA || 'N/A'}"`,
      `"${item.descripcion || 'Sin descripcion'}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `inventario_citt_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtrado dinámico en tiempo real
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.nombre.toLowerCase().includes(search.toLowerCase()) ||
      item.codigoSerie.toLowerCase().includes(search.toLowerCase()) ||
      item.categoria.toLowerCase().includes(search.toLowerCase()) ||
      (item.prestadoA && item.prestadoA.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'TODOS' || item.estado === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Métricas calculadas en tiempo real
  const totalEquipos = items.length;
  const disponiblesCount = items.filter((i) => i.estado === 'DISPONIBLE').length;
  const prestadosCount = items.filter((i) => i.estado === 'PRESTADO').length;
  const mantenimientoCount = items.filter((i) => i.estado === 'MANTENIMIENTO').length;

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="border-b border-slate-700 pb-4">
          <h1 className="text-3xl font-bold text-blue-400">Inventario CITT - Duoc UC</h1>
          <p className="text-slate-400">Gestión de activos, equipos y pañol</p>
        </header>

        {/* Tarjetas KPI de Métricas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
            <p className="text-xs text-slate-400 uppercase font-semibold">Total Activos</p>
            <p className="text-2xl font-bold text-white mt-1">{totalEquipos}</p>
          </div>
          <div className="bg-slate-800 p-4 rounded-xl border border-emerald-900/50">
            <p className="text-xs text-emerald-400 uppercase font-semibold">Disponibles</p>
            <p className="text-2xl font-bold text-emerald-300 mt-1">{disponiblesCount}</p>
          </div>
          <div className="bg-slate-800 p-4 rounded-xl border border-amber-900/50">
            <p className="text-xs text-amber-400 uppercase font-semibold">Prestados</p>
            <p className="text-2xl font-bold text-amber-300 mt-1">{prestadosCount}</p>
          </div>
          <div className="bg-slate-800 p-4 rounded-xl border border-blue-900/50">
            <p className="text-xs text-blue-400 uppercase font-semibold">En Mantenimiento</p>
            <p className="text-2xl font-bold text-blue-300 mt-1">{mantenimientoCount}</p>
          </div>
        </div>

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
            <select
              value={form.estado}
              onChange={(e) => setForm({ ...form, estado: e.target.value as Item['estado'] })}
              className="p-2 rounded bg-slate-900 border border-slate-700 text-white"
            >
              <option value="DISPONIBLE">DISPONIBLE</option>
              <option value="PRESTADO">PRESTADO</option>
              <option value="MANTENIMIENTO">MANTENIMIENTO</option>
              <option value="DEBAJA">DEBAJA</option>
            </select>
            <input
              type="text"
              placeholder="Descripción breve"
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              className="p-2 rounded bg-slate-900 border border-slate-700 text-white"
            />
          </div>
          <button type="submit" className="bg-blue-600 hover:bg-blue-500 font-semibold px-4 py-2 rounded">
            Guardar en PostgreSQL
          </button>
        </form>

        {/* Sección de Búsqueda, Exportación y Tabla */}
        <section className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-xl font-semibold text-slate-200">Activos en Base de Datos</h2>
            
            {/* Buscador, Filtro y Botón Exportar */}
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <input
                type="text"
                placeholder="🔍 Buscar por nombre, código..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="p-2 text-sm rounded bg-slate-900 border border-slate-700 text-white w-full sm:w-56"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="p-2 text-sm rounded bg-slate-900 border border-slate-700 text-white"
              >
                <option value="TODOS">Todos los estados</option>
                <option value="DISPONIBLE">DISPONIBLE</option>
                <option value="PRESTADO">PRESTADO</option>
                <option value="MANTENIMIENTO">MANTENIMIENTO</option>
                <option value="DEBAJA">DEBAJA</option>
              </select>
              <button
                onClick={handleExportCSV}
                className="bg-emerald-700 hover:bg-emerald-600 text-white font-medium text-sm px-3 py-2 rounded flex items-center justify-center gap-1"
              >
                📥 Exportar Excel
              </button>
            </div>
          </div>

          {loading ? (
            <p className="text-slate-400">Cargando datos...</p>
          ) : filteredItems.length === 0 ? (
            <p className="text-slate-400">No se encontraron activos con el filtro ingresado.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-400 text-sm">
                    <th className="p-2">Código</th>
                    <th className="p-2">Nombre</th>
                    <th className="p-2">Categoría</th>
                    <th className="p-2">Ubicación</th>
                    <th className="p-2">Estado</th>
                    <th className="p-2">Asignado A</th>
                    <th className="p-2 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                      <td className="p-2 font-mono text-sm text-blue-300">{item.codigoSerie}</td>
                      <td className="p-2 font-medium">{item.nombre}</td>
                      <td className="p-2 text-slate-300 text-sm">{item.categoria}</td>
                      <td className="p-2 text-slate-400 text-sm">{item.ubicacion || 'N/A'}</td>
                      <td className="p-2">
                        <span className={`px-2 py-1 text-xs rounded border ${
                          item.estado === 'DISPONIBLE' ? 'bg-emerald-900/60 text-emerald-300 border-emerald-700' :
                          item.estado === 'PRESTADO' ? 'bg-amber-900/60 text-amber-300 border-amber-700' :
                          item.estado === 'MANTENIMIENTO' ? 'bg-blue-900/60 text-blue-300 border-blue-700' :
                          'bg-rose-900/60 text-rose-300 border-rose-700'
                        }`}>
                          {item.estado}
                        </span>
                      </td>
                      <td className="p-2 text-sm text-slate-300">
                        {item.prestadoA ? (
                          <span className="text-amber-300 font-medium">👤 {item.prestadoA}</span>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </td>
                      <td className="p-2 text-center space-x-2">
                        {item.estado === 'DISPONIBLE' && (
                          <button
                            onClick={() => setLoanItem(item)}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-2.5 py-1 rounded"
                          >
                            Prestar
                          </button>
                        )}
                        {item.estado === 'PRESTADO' && (
                          <button
                            onClick={() => handleReturnLoan(item)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-2.5 py-1 rounded"
                          >
                            Devolver
                          </button>
                        )}
                        <button
                          onClick={() => setEditingItem(item)}
                          className="bg-amber-600 hover:bg-amber-500 text-white text-xs px-2.5 py-1 rounded"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="bg-rose-600 hover:bg-rose-500 text-white text-xs px-2.5 py-1 rounded"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* Modal de Préstamo */}
      {loanItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-md space-y-4">
            <h3 className="text-xl font-bold text-slate-100">Registrar Préstamo de Equipo</h3>
            <p className="text-sm text-slate-400">Equipo: <span className="text-blue-300 font-medium">{loanItem.nombre}</span> ({loanItem.codigoSerie})</p>
            <form onSubmit={handleConfirmLoan} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Nombre / Rut del Alumno o Docente</label>
                <input
                  type="text"
                  placeholder="Ej: Juan Pérez (Rut 20.123.456-7)"
                  value={prestadoAInput}
                  onChange={(e) => setPrestadoAInput(e.target.value)}
                  className="w-full p-2 rounded bg-slate-900 border border-slate-700 text-white text-sm"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setLoanItem(null)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-slate-300 text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded font-semibold text-white text-sm"
                >
                  Confirmar Préstamo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Edición */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-lg space-y-4">
            <h3 className="text-xl font-bold text-slate-100">Editar Activo</h3>
            <form onSubmit={handleUpdate} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400">Nombre</label>
                <input
                  type="text"
                  value={editingItem.nombre}
                  onChange={(e) => setEditingItem({ ...editingItem, nombre: e.target.value })}
                  className="w-full p-2 rounded bg-slate-900 border border-slate-700 text-white"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Código de Serie</label>
                <input
                  type="text"
                  value={editingItem.codigoSerie}
                  onChange={(e) => setEditingItem({ ...editingItem, codigoSerie: e.target.value })}
                  className="w-full p-2 rounded bg-slate-900 border border-slate-700 text-white"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Categoría</label>
                <input
                  type="text"
                  value={editingItem.categoria}
                  onChange={(e) => setEditingItem({ ...editingItem, categoria: e.target.value })}
                  className="w-full p-2 rounded bg-slate-900 border border-slate-700 text-white"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Estado</label>
                <select
                  value={editingItem.estado}
                  onChange={(e) => setEditingItem({ ...editingItem, estado: e.target.value as Item['estado'] })}
                  className="w-full p-2 rounded bg-slate-900 border border-slate-700 text-white"
                >
                  <option value="DISPONIBLE">DISPONIBLE</option>
                  <option value="PRESTADO">PRESTADO</option>
                  <option value="MANTENIMIENTO">MANTENIMIENTO</option>
                  <option value="DEBAJA">DEBAJA</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400">Ubicación</label>
                <input
                  type="text"
                  value={editingItem.ubicacion || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, ubicacion: e.target.value })}
                  className="w-full p-2 rounded bg-slate-900 border border-slate-700 text-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Descripción</label>
                <input
                  type="text"
                  value={editingItem.descripcion || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, descripcion: e.target.value })}
                  className="w-full p-2 rounded bg-slate-900 border border-slate-700 text-white"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded font-semibold text-white"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}