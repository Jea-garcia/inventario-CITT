'use client';

import { useEffect, useState } from 'react';
import { getItems, createItem, updateItem, deleteItem, Item } from '@/services/api';

type UserRole = 'ADMINISTRADOR' | 'ALUMNO_LIDER' | 'USUARIO_GLOBAL';
type Tab = 'STOCK' | 'SOLICITUDES' | 'FILAMENTO' | 'ALERTAS';

interface SolicitudLocal {
  id: string;
  itemNombre: string;
  codigoSerie: string;
  solicitanteNombre: string;
  estado: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA';
  fecha: string;
}

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('STOCK');
  const [activeRole, setActiveRole] = useState<UserRole>('ADMINISTRADOR');

  // Estado para menú hamburguesa móvil
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Solicitudes
  const [solicitudes, setSolicitudes] = useState<SolicitudLocal[]>([]);
  const [requestItem, setRequestItem] = useState<Item | null>(null);
  const [solicitanteInput, setSolicitanteInput] = useState('');

  // Descuento de Filamento 3D
  const [filamentItem, setFilamentItem] = useState<Item | null>(null);
  const [descuentoGramos, setDescuentoGramos] = useState<number>(50);

  // Filtros
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('TODOS');

  // Formulario con Descripción/Comentario reincorporado
  const [form, setForm] = useState({
    nombre: '',
    codigoSerie: '',
    categoria: 'Computadores',
    ubicacion: 'Casillero A-1',
    estado: 'DISPONIBLE' as Item['estado'],
    descripcion: '',
    esConsumible: false,
    cantidadGramos: 10000,
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
    if (!form.nombre || !form.codigoSerie) return;
    try {
      await createItem(form);
      setForm({
        nombre: '',
        codigoSerie: '',
        categoria: 'Computadores',
        ubicacion: 'Casillero A-1',
        estado: 'DISPONIBLE',
        descripcion: '',
        esConsumible: false,
        cantidadGramos: 10000,
      });
      loadItems();
    } catch (err) {
      alert('Error guardando el activo');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar activo del inventario?')) return;
    try {
      await deleteItem(id);
      loadItems();
    } catch (err) {
      alert('Error al eliminar');
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
      alert('Error al actualizar');
    }
  };

  const handleDiscountFilament = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!filamentItem || descuentoGramos <= 0) return;

    const actualGramos = filamentItem.cantidadGramos || 0;
    const nuevoStockGramos = Math.max(0, actualGramos - descuentoGramos);

    try {
      await updateItem(filamentItem.id, { cantidadGramos: nuevoStockGramos });
      setFilamentItem(null);
      setDescuentoGramos(50);
      loadItems();
      alert(`Descuento aplicado. Nuevo stock: ${(nuevoStockGramos / 1000).toFixed(2)} kg (${nuevoStockGramos} g)`);
    } catch (err) {
      alert('Error al descontar filamento');
    }
  };

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
      alert('Error registrando préstamo');
    }
  };

  const handleReturnLoan = async (item: Item) => {
    if (!confirm(`¿Confirmar devolución de ${item.nombre}?`)) return;
    try {
      await updateItem(item.id, { estado: 'DISPONIBLE', prestadoA: '' });
      loadItems();
    } catch (err) {
      alert('Error en devolución');
    }
  };

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestItem || !solicitanteInput.trim()) return;

    const nueva: SolicitudLocal = {
      id: Date.now().toString(),
      itemNombre: requestItem.nombre,
      codigoSerie: requestItem.codigoSerie,
      solicitanteNombre: solicitanteInput,
      estado: 'PENDIENTE',
      fecha: new Date().toLocaleDateString('es-CL'),
    };

    setSolicitudes([nueva, ...solicitudes]);
    setRequestItem(null);
    setSolicitanteInput('');
    alert('Solicitud enviada a revisión');
  };

  const handleApproveRequest = async (sol: SolicitudLocal) => {
    const itemTarget = items.find((i) => i.codigoSerie === sol.codigoSerie);
    if (itemTarget) {
      try {
        await updateItem(itemTarget.id, { estado: 'PRESTADO', prestadoA: sol.solicitanteNombre });
        setSolicitudes(solicitudes.map((s) => (s.id === sol.id ? { ...s, estado: 'APROBADA' } : s)));
        loadItems();
      } catch (err) {
        alert('Error al aprobar');
      }
    }
  };

  const handleExportCSV = () => {
    const headers = ['Codigo', 'Nombre', 'Categoria', 'Ubicacion', 'Estado', 'Comentario', 'Asignado A'];
    const rows = filteredItems.map((i) => [
      `"${i.codigoSerie}"`,
      `"${i.nombre}"`,
      `"${i.categoria}"`,
      `"${i.ubicacion}"`,
      `"${i.estado}"`,
      `"${i.descripcion || ''}"`,
      `"${i.prestadoA || 'N/A'}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `inventario_citt_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.nombre.toLowerCase().includes(search.toLowerCase()) ||
      item.codigoSerie.toLowerCase().includes(search.toLowerCase()) ||
      item.categoria.toLowerCase().includes(search.toLowerCase()) ||
      (item.descripcion && item.descripcion.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'TODOS' || item.estado === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filamentosBajos = items.filter((i) => i.esConsumible && (i.cantidadGramos || 0) <= (i.stockMinimoGramos || 1000));

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-900 text-slate-100">
      {/* Barra superior móvil con botón Hamburguesa */}
      <div className="md:hidden bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center">
        <div>
          <h1 className="text-lg font-bold text-blue-400">CITT Stock</h1>
          <p className="text-xs text-slate-400">Duoc UC • Pañol Digital</p>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded bg-slate-700 text-slate-200 text-xl focus:outline-none"
        >
          ☰
        </button>
      </div>

      {/* Sidebar (Desktop + Menú colapsable en Móvil) */}
      <aside className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:block w-full md:w-64 bg-slate-800 border-r border-slate-700 p-6 flex flex-col justify-between`}>
        <div className="space-y-6">
          <div className="hidden md:block border-b border-slate-700 pb-4">
            <h1 className="text-xl font-bold text-blue-400">CITT Stock</h1>
            <p className="text-xs text-slate-400">Duoc UC • Pañol Digital</p>
          </div>

          <nav className="space-y-2">
            <button
              onClick={() => { setActiveTab('STOCK'); setIsMobileMenuOpen(false); }}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition ${
                activeTab === 'STOCK' ? 'bg-blue-600 text-white' : 'hover:bg-slate-700 text-slate-300'
              }`}
            >
              📦 Catálogo y Stock
            </button>
            <button
              onClick={() => { setActiveTab('SOLICITUDES'); setIsMobileMenuOpen(false); }}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition flex justify-between items-center ${
                activeTab === 'SOLICITUDES' ? 'bg-blue-600 text-white' : 'hover:bg-slate-700 text-slate-300'
              }`}
            >
              <span>📌 Solicitudes</span>
              {solicitudes.filter((s) => s.estado === 'PENDIENTE').length > 0 && (
                <span className="bg-amber-500 text-slate-900 text-xs px-2 py-0.5 rounded-full font-bold">
                  {solicitudes.filter((s) => s.estado === 'PENDIENTE').length}
                </span>
              )}
            </button>
            <button
              onClick={() => { setActiveTab('FILAMENTO'); setIsMobileMenuOpen(false); }}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition ${
                activeTab === 'FILAMENTO' ? 'bg-blue-600 text-white' : 'hover:bg-slate-700 text-slate-300'
              }`}
            >
              🧵 Filamento 3D (g/kg)
            </button>
            <button
              onClick={() => { setActiveTab('ALERTAS'); setIsMobileMenuOpen(false); }}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition flex justify-between items-center ${
                activeTab === 'ALERTAS' ? 'bg-blue-600 text-white' : 'hover:bg-slate-700 text-slate-300'
              }`}
            >
              <span>⚠️ Alertas de Stock</span>
              {filamentosBajos.length > 0 && (
                <span className="bg-rose-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                  {filamentosBajos.length}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Selector de Rol en Sidebar */}
        <div className="bg-slate-900 p-3 rounded-lg border border-slate-700 mt-6 md:mt-0">
          <p className="text-xs text-slate-400 font-semibold mb-2">Rol del Usuario:</p>
          <select
            value={activeRole}
            onChange={(e) => setActiveRole(e.target.value as UserRole)}
            className="w-full bg-slate-800 text-xs text-blue-300 font-semibold p-2 rounded border border-slate-700"
          >
            <option value="ADMINISTRADOR">🛡️ ADMINISTRADOR</option>
            <option value="ALUMNO_LIDER">🎓 ALUMNO LÍDER</option>
            <option value="USUARIO_GLOBAL">👤 USUARIO GLOBAL</option>
          </select>
        </div>
      </aside>

      {/* Contenido Principal */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center pb-6 mb-6 border-b border-slate-800">
          <div>
            <h2 className="text-2xl font-bold">
              {activeTab === 'STOCK' && '📦 Gestión de Activos e Inventario'}
              {activeTab === 'SOLICITUDES' && '📌 Solicitudes de Préstamo y Aprobaciones'}
              {activeTab === 'FILAMENTO' && '🧵 Módulo Especial: Consumibles y Filamento 3D'}
              {activeTab === 'ALERTAS' && '⚠️ Centro de Alertas y Stock Crítico'}
            </h2>
            <p className="text-sm text-slate-400">Perfil en uso: <span className="text-blue-400 font-semibold">{activeRole}</span></p>
          </div>
        </header>

        {/* PESTAÑA 1: STOCK Y CATÁLOGO */}
        {activeTab === 'STOCK' && (
          <div className="space-y-8">
            {/* Formulario exclusivo Admin */}
            {activeRole === 'ADMINISTRADOR' && (
              <form onSubmit={handleSubmit} className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-4">
                <h3 className="text-lg font-semibold text-slate-200">Registrar Nuevo Activo o Consumible</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder="Nombre (ej: Laptop Lenovo / Filamento PLA)"
                    value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    className="p-2 rounded bg-slate-900 border border-slate-700 text-sm"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Código Serie (ej: CITT-LAP-02)"
                    value={form.codigoSerie}
                    onChange={(e) => setForm({ ...form, codigoSerie: e.target.value })}
                    className="p-2 rounded bg-slate-900 border border-slate-700 text-sm"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Ubicación / Casillero (ej: Rack nivel 2)"
                    value={form.ubicacion}
                    onChange={(e) => setForm({ ...form, ubicacion: e.target.value })}
                    className="p-2 rounded bg-slate-900 border border-slate-700 text-sm"
                  />
                  <select
                    value={form.categoria}
                    onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                    className="p-2 rounded bg-slate-900 border border-slate-700 text-sm"
                  >
                    <option value="Computadores">Computadores</option>
                    <option value="Impresoras 3D">Impresoras 3D</option>
                    <option value="Filamentos / Consumibles">Filamentos / Consumibles</option>
                    <option value="Herramientas">Herramientas</option>
                  </select>

                  <select
                    value={form.estado}
                    onChange={(e) => setForm({ ...form, estado: e.target.value as Item['estado'] })}
                    className="p-2 rounded bg-slate-900 border border-slate-700 text-sm text-white"
                  >
                    <option value="DISPONIBLE">DISPONIBLE</option>
                    <option value="PRESTADO">PRESTADO</option>
                    <option value="MANTENIMIENTO">MANTENIMIENTO</option>
                    <option value="DEBAJA">DEBAJA</option>
                  </select>

                  {/* Campo de Comentario/Observación */}
                  <input
                    type="text"
                    placeholder="Comentario / Nota (ej: Batería mala, sin cargador)"
                    value={form.descripcion}
                    onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                    className="p-2 rounded bg-slate-900 border border-slate-700 text-sm"
                  />

                  <div className="flex items-center space-x-2 bg-slate-900 p-2 rounded border border-slate-700">
                    <input
                      type="checkbox"
                      id="esConsumible"
                      checked={form.esConsumible}
                      onChange={(e) => setForm({ ...form, esConsumible: e.target.checked })}
                      className="rounded"
                    />
                    <label htmlFor="esConsumible" className="text-xs text-slate-300">¿Es Consumible (Filamento)?</label>
                  </div>

                  {form.esConsumible && (
                    <input
                      type="number"
                      placeholder="Gramos Iniciales (ej: 10000 g = 10 kg)"
                      value={form.cantidadGramos}
                      onChange={(e) => setForm({ ...form, cantidadGramos: parseFloat(e.target.value) })}
                      className="p-2 rounded bg-slate-900 border border-slate-700 text-sm"
                    />
                  )}
                </div>
                <button type="submit" className="bg-blue-600 hover:bg-blue-500 font-semibold px-4 py-2 rounded text-sm">
                  Guardar Activo
                </button>
              </form>
            )}

            {/* Tabla Principal */}
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <input
                    type="text"
                    placeholder="🔍 Buscar por código, nombre, notas..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="p-2 rounded bg-slate-900 border border-slate-700 text-sm w-full sm:w-64"
                  />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="p-2 rounded bg-slate-900 border border-slate-700 text-sm text-white"
                  >
                    <option value="TODOS">Todos los estados</option>
                    <option value="DISPONIBLE">DISPONIBLE</option>
                    <option value="PRESTADO">PRESTADO</option>
                    <option value="MANTENIMIENTO">MANTENIMIENTO</option>
                    <option value="DEBAJA">DEBAJA</option>
                  </select>
                </div>

                {activeRole === 'ADMINISTRADOR' && (
                  <button onClick={handleExportCSV} className="bg-emerald-700 hover:bg-emerald-600 text-sm px-3 py-2 rounded">
                    📥 Exportar Excel
                  </button>
                )}
              </div>

              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-400">
                    <th className="p-2">Código</th>
                    <th className="p-2">Nombre</th>
                    <th className="p-2">Casillero/Ubicación</th>
                    <th className="p-2">Estado / Stock</th>
                    <th className="p-2">Comentario / Nota</th>
                    <th className="p-2">Asignado A</th>
                    <th className="p-2 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                      <td className="p-2 font-mono text-blue-300">{item.codigoSerie}</td>
                      <td className="p-2 font-medium">{item.nombre}</td>
                      <td className="p-2 text-slate-400">{item.ubicacion || 'Sin Casillero'}</td>
                      <td className="p-2">
                        {item.esConsumible ? (
                          <span className="text-amber-300 font-bold">
                            {((item.cantidadGramos || 0) / 1000).toFixed(2)} kg ({item.cantidadGramos} g)
                          </span>
                        ) : (
                          <span className={`px-2 py-0.5 text-xs rounded border ${
                            item.estado === 'DISPONIBLE' ? 'bg-emerald-900/60 text-emerald-300 border-emerald-700' :
                            item.estado === 'PRESTADO' ? 'bg-amber-900/60 text-amber-300 border-amber-700' :
                            item.estado === 'MANTENIMIENTO' ? 'bg-blue-900/60 text-blue-300 border-blue-700' :
                            'bg-rose-900/60 text-rose-300 border-rose-700'
                          }`}>
                            {item.estado}
                          </span>
                        )}
                      </td>
                      <td className="p-2 text-slate-300 text-xs italic">
                        {item.descripcion || '-'}
                      </td>
                      <td className="p-2 text-slate-300">{item.prestadoA || '-'}</td>
                      <td className="p-2 text-center space-x-2">
                        {(activeRole === 'ADMINISTRADOR' || activeRole === 'ALUMNO_LIDER') && !item.esConsumible && (
                          item.estado === 'DISPONIBLE' ? (
                            <button onClick={() => setLoanItem(item)} className="bg-indigo-600 px-2 py-1 rounded text-xs">Prestar</button>
                          ) : (
                            <button onClick={() => handleReturnLoan(item)} className="bg-emerald-600 px-2 py-1 rounded text-xs">Devolver</button>
                          )
                        )}
                        {activeRole === 'USUARIO_GLOBAL' && item.estado === 'DISPONIBLE' && !item.esConsumible && (
                          <button onClick={() => setRequestItem(item)} className="bg-blue-600 px-2 py-1 rounded text-xs">Solicitar</button>
                        )}
                        {activeRole === 'ADMINISTRADOR' && (
                          <>
                            <button onClick={() => setEditingItem(item)} className="bg-amber-600 px-2 py-1 rounded text-xs">Editar</button>
                            <button onClick={() => handleDelete(item.id)} className="bg-rose-600 px-2 py-1 rounded text-xs">Eliminar</button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PESTAÑA 2: SOLICITUDES */}
        {activeTab === 'SOLICITUDES' && (
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-4">
            <h3 className="text-lg font-semibold text-amber-300">📌 Gestión de Solicitudes Presenciales</h3>
            {solicitudes.length === 0 ? (
              <p className="text-slate-400 text-sm">No hay solicitudes registradas.</p>
            ) : (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-400">
                    <th className="p-2">Equipo</th>
                    <th className="p-2">Solicitante</th>
                    <th className="p-2">Fecha</th>
                    <th className="p-2">Estado</th>
                    <th className="p-2 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {solicitudes.map((sol) => (
                    <tr key={sol.id} className="border-b border-slate-700/50">
                      <td className="p-2 font-medium">{sol.itemNombre} ({sol.codigoSerie})</td>
                      <td className="p-2 text-amber-200">{sol.solicitanteNombre}</td>
                      <td className="p-2 text-slate-400">{sol.fecha}</td>
                      <td className="p-2">
                        <span className="px-2 py-0.5 text-xs rounded border bg-amber-900/60 text-amber-300 border-amber-700">
                          {sol.estado}
                        </span>
                      </td>
                      <td className="p-2 text-center space-x-2">
                        {(activeRole === 'ADMINISTRADOR' || activeRole === 'ALUMNO_LIDER') && sol.estado === 'PENDIENTE' && (
                          <button onClick={() => handleApproveRequest(sol)} className="bg-emerald-600 px-2 py-1 rounded text-xs">
                            Aprobar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* PESTAÑA 3: FILAMENTO 3D */}
        {activeTab === 'FILAMENTO' && (
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-blue-300">🧵 Descuento Automático en Gramos (g) vs Kilogramos (kg)</h3>
              <p className="text-xs text-slate-400">Conversión automática: Ingrese en kg, el sistema descuenta en g para una impresión exacta.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {items.filter((i) => i.esConsumible).map((fil) => (
                <div key={fil.id} className="bg-slate-900 p-4 rounded-xl border border-slate-700 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-white">{fil.nombre}</h4>
                      <p className="text-xs text-slate-400">Código: {fil.codigoSerie}</p>
                    </div>
                    <span className="text-xl font-black text-amber-400">
                      {((fil.cantidadGramos || 0) / 1000).toFixed(2)} kg
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">Stock exacto: <strong className="text-slate-200">{fil.cantidadGramos} g</strong></p>
                  
                  {(activeRole === 'ADMINISTRADOR' || activeRole === 'ALUMNO_LIDER') && (
                    <button
                      onClick={() => setFilamentItem(fil)}
                      className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs py-2 rounded"
                    >
                      ✂️ Descontar Impresión (Gramos)
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PESTAÑA 4: ALERTAS */}
        {activeTab === 'ALERTAS' && (
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-4">
            <h3 className="text-lg font-semibold text-rose-400">⚠️ Alertas de Stock Crítico</h3>
            {filamentosBajos.length === 0 ? (
              <p className="text-slate-400 text-sm">✅ Todos los consumibles están por encima del stock mínimo.</p>
            ) : (
              <div className="space-y-3">
                {filamentosBajos.map((f) => (
                  <div key={f.id} className="p-4 rounded-lg bg-rose-950/40 border border-rose-800/60 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-rose-200">{f.nombre} ({f.codigoSerie})</p>
                      <p className="text-xs text-slate-400">Stock actual: {f.cantidadGramos} g | Mínimo requerido: {f.stockMinimoGramos} g</p>
                    </div>
                    <span className="bg-rose-600 text-white text-xs px-2.5 py-1 rounded font-bold">STOCK CRÍTICO</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modal Descuento Filamento */}
      {filamentItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-md space-y-4">
            <h3 className="text-xl font-bold text-slate-100">Descontar Filamento Usado</h3>
            <p className="text-sm text-slate-400">Bobina: <span className="text-blue-300 font-medium">{filamentItem.nombre}</span></p>
            <form onSubmit={handleDiscountFilament} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Gramos utilizados en la impresión (g)</label>
                <input
                  type="number"
                  value={descuentoGramos}
                  onChange={(e) => setDescuentoGramos(parseFloat(e.target.value))}
                  className="w-full p-2 rounded bg-slate-900 border border-slate-700 text-white text-sm"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={() => setFilamentItem(null)} className="px-4 py-2 bg-slate-700 rounded text-slate-300 text-xs">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded font-semibold text-white text-xs">Aplicar Descuento</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edición */}
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
                <label className="text-xs text-slate-400">Ubicación / Casillero</label>
                <input
                  type="text"
                  value={editingItem.ubicacion || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, ubicacion: e.target.value })}
                  className="w-full p-2 rounded bg-slate-900 border border-slate-700 text-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Comentario / Observación</label>
                <input
                  type="text"
                  value={editingItem.descripcion || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, descripcion: e.target.value })}
                  className="w-full p-2 rounded bg-slate-900 border border-slate-700 text-white"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-3">
                <button type="button" onClick={() => setEditingItem(null)} className="px-4 py-2 bg-slate-700 rounded text-slate-300">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded font-semibold text-white">Guardar Cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Solicitud */}
      {requestItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-md space-y-4">
            <h3 className="text-xl font-bold text-slate-100">Crear Solicitud de Equipo</h3>
            <p className="text-sm text-slate-400">Equipo: <span className="text-blue-300 font-medium">{requestItem.nombre}</span></p>
            <form onSubmit={handleCreateRequest} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Nombre Completo y Rut</label>
                <input
                  type="text"
                  placeholder="Ej: Juan Pérez (21.000.000-0)"
                  value={solicitanteInput}
                  onChange={(e) => setSolicitanteInput(e.target.value)}
                  className="w-full p-2 rounded bg-slate-900 border border-slate-700 text-white text-sm"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button type="button" onClick={() => setRequestItem(null)} className="px-4 py-2 bg-slate-700 rounded text-xs">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded font-semibold text-xs">Enviar Solicitud</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Préstamo Directo */}
      {loanItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-md space-y-4">
            <h3 className="text-xl font-bold text-slate-100">Registrar Préstamo</h3>
            <p className="text-sm text-slate-400">Equipo: <span className="text-blue-300 font-medium">{loanItem.nombre}</span></p>
            <form onSubmit={handleConfirmLoan} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Nombre / Rut del Alumno o Docente</label>
                <input
                  type="text"
                  placeholder="Ej: Juan Pérez (20.123.456-7)"
                  value={prestadoAInput}
                  onChange={(e) => setPrestadoAInput(e.target.value)}
                  className="w-full p-2 rounded bg-slate-900 border border-slate-700 text-white text-sm"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button type="button" onClick={() => setLoanItem(null)} className="px-4 py-2 bg-slate-700 rounded text-xs">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded font-semibold text-xs">Confirmar Préstamo</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}