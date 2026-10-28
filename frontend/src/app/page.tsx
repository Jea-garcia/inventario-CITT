'use client';

import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { getItems, createItem, updateItem, deleteItem, Item } from '@/services/api';

type UserRole = 'ADMINISTRADOR' | 'ALUMNO_LIDER' | 'USUARIO_GLOBAL';
type Tab = 'STOCK' | 'SOLICITUDES' | 'FILAMENTO' | 'MANTENIMIENTO' | 'ALERTAS';

interface UserSession {
  nombre: string;
  email: string;
  rol: UserRole;
}

interface SolicitudLocal {
  id: string;
  itemNombre: string;
  codigoSerie: string;
  solicitanteNombre: string;
  escuela: string;
  estado: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA';
  fecha: string;
}

interface OrdenTrabajo {
  id: string;
  codigoSerie: string;
  equipoNombre: string;
  tipo: 'PREVENTIVO' | 'CORRECTIVO';
  estadoOT: 'En proceso' | 'En diagnóstico' | 'Finalizada';
  responsable: string;
  comentario: string;
  fecha: string;
}

const ESCUELAS_DUOC = [
  'Informática y Telecomunicaciones',
  'Construcción',
  'Mecánica y Energía',
  'Administración y Negocios',
  'Salud',
  'Turismo y Hotelería',
  'Recursos Naturales',
];

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('STOCK');

  // Sesión y Rol
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');

  // Menú Hamburguesa Móvil
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Solicitudes con Selección de Escuela
  const [solicitudes, setSolicitudes] = useState<SolicitudLocal[]>([]);
  const [requestItem, setRequestItem] = useState<Item | null>(null);
  const [solicitanteInput, setSolicitanteInput] = useState('');
  const [escuelaSeleccionada, setEscuelaSeleccionada] = useState(ESCUELAS_DUOC[0]);

  // Modal QR
  const [qrItem, setQrItem] = useState<Item | null>(null);

  // Mantenimiento OT con arreglo inicial seguro sin hidratación
  const [ordenesTrabajo, setOrdenesTrabajo] = useState<OrdenTrabajo[]>([
    {
      id: 'ot-1',
      codigoSerie: 'CITT-LAP-02',
      equipoNombre: 'Notebook Lenovo',
      tipo: 'CORRECTIVO',
      estadoOT: 'En proceso',
      responsable: 'CIT',
      comentario: 'cambio de batería',
      fecha: '2026-10-28',
    },
  ]);
  const [otItem, setOtItem] = useState<Item | null>(null);
  const [formOT, setFormOT] = useState({
    tipo: 'CORRECTIVO' as 'PREVENTIVO' | 'CORRECTIVO',
    responsable: '',
    comentario: '',
  });

  // Filamento 3D
  const [filamentItem, setFilamentItem] = useState<Item | null>(null);
  const [descuentoGramos, setDescuentoGramos] = useState<number>(50);

  // Filtros
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('TODOS');

  // Formulario Activo
  const [form, setForm] = useState({
    nombre: '',
    codigoSerie: 'EQ-CITT-001',
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

  // Autogenerar Código por Categoría
  const handleCategoryChange = (cat: string) => {
    let prefijo = 'EQ-CITT-';
    if (cat === 'Impresoras 3D') prefijo = 'IM-CITT-';
    if (cat === 'Filamentos / Consumibles') prefijo = '3D-CITT-';
    if (cat === 'Herramientas') prefijo = 'TA-CITT-';

    const count = items.filter((i) => i.categoria === cat).length + 1;
    const autoCodigo = `${prefijo}${String(count).padStart(3, '0')}`;

    setForm({
      ...form,
      categoria: cat,
      codigoSerie: autoCodigo,
      esConsumible: cat === 'Filamentos / Consumibles',
    });
  };

  // Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (loginEmail === 'admin@duoc.cl' && loginPass === 'admin') {
      setUserSession({ nombre: 'Administrador CITT', email: loginEmail, rol: 'ADMINISTRADOR' });
    } else if (loginEmail === 'lider@duoc.cl' && loginPass === 'lider') {
      setUserSession({ nombre: 'Alumno Líder Pañol', email: loginEmail, rol: 'ALUMNO_LIDER' });
    } else if (loginEmail === 'alumno@duoc.cl' && loginPass === 'alumno') {
      setUserSession({ nombre: 'Estudiante Duoc UC', email: loginEmail, rol: 'USUARIO_GLOBAL' });
    } else {
      setLoginError('Credenciales incorrectas.');
    }
  };

  const handleLogout = () => {
    setUserSession(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre || !form.codigoSerie) return;
    try {
      await createItem(form);
      setForm({
        nombre: '',
        codigoSerie: 'EQ-CITT-001',
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
      alert(`Descuento aplicado. Nuevo stock: ${(nuevoStockGramos / 1000).toFixed(2)} kg`);
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

    const hoy = new Date().toISOString().split('T')[0];
    const nueva: SolicitudLocal = {
      id: Date.now().toString(),
      itemNombre: requestItem.nombre,
      codigoSerie: requestItem.codigoSerie,
      solicitanteNombre: solicitanteInput,
      escuela: escuelaSeleccionada,
      estado: 'PENDIENTE',
      fecha: hoy,
    };

    setSolicitudes([nueva, ...solicitudes]);
    setRequestItem(null);
    setSolicitanteInput('');
    alert('Solicitud enviada a revisión');
  };

  const handleCreateOT = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otItem || !formOT.responsable.trim()) return;

    const hoy = new Date().toISOString().split('T')[0];
    const nuevaOT: OrdenTrabajo = {
      id: Date.now().toString(),
      codigoSerie: otItem.codigoSerie,
      equipoNombre: otItem.nombre,
      tipo: formOT.tipo,
      estadoOT: 'En proceso',
      responsable: formOT.responsable,
      comentario: formOT.comentario,
      fecha: hoy,
    };

    try {
      await updateItem(otItem.id, { estado: 'MANTENIMIENTO', descripcion: `[OT ${formOT.tipo}] ${formOT.comentario}` });
      setOrdenesTrabajo([nuevaOT, ...ordenesTrabajo]);
      setOtItem(null);
      setFormOT({ tipo: 'CORRECTIVO', responsable: '', comentario: '' });
      loadItems();
    } catch (err) {
      alert('Error al poner en mantenimiento');
    }
  };

  const handleUpdateOTState = async (otId: string, nuevoEstado: OrdenTrabajo['estadoOT']) => {
    const otTarget = ordenesTrabajo.find((o) => o.id === otId);
    if (!otTarget) return;

    setOrdenesTrabajo(
      ordenesTrabajo.map((o) => (o.id === otId ? { ...o, estadoOT: nuevoEstado } : o))
    );

    if (nuevoEstado === 'Finalizada') {
      const itemTarget = items.find((i) => i.codigoSerie === otTarget.codigoSerie);
      if (itemTarget) {
        try {
          await updateItem(itemTarget.id, { estado: 'DISPONIBLE' });
          loadItems();
          alert(`Mantenimiento finalizado. El equipo ${otTarget.equipoNombre} ya está DISPONIBLE.`);
        } catch (err) {
          alert('Error actualizando el activo');
        }
      }
    }
  };

  const handleApproveRequest = async (sol: SolicitudLocal) => {
    const itemTarget = items.find((i) => i.codigoSerie === sol.codigoSerie);
    if (itemTarget) {
      try {
        await updateItem(itemTarget.id, { estado: 'PRESTADO', prestadoA: `${sol.solicitanteNombre} (${sol.escuela})` });
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
      `"${i.prestadoA || 'N/A'}"`,
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

  if (!userSession) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 w-full max-w-md space-y-6 shadow-2xl">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-black text-blue-400">CITT Stock</h1>
            <p className="text-xs text-slate-400">Sistema de Inventario • Duoc UC</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {loginError && <div className="bg-rose-950/80 border border-rose-800 text-rose-300 p-3 rounded text-xs text-center">{loginError}</div>}
            <div>
              <label className="text-xs text-slate-400 block mb-1">Correo Institucional</label>
              <input
                type="email"
                placeholder="admin@duoc.cl / lider@duoc.cl / alumno@duoc.cl"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm"
                required
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Contraseña</label>
              <input
                type="password"
                placeholder="••••••••"
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
                className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm"
                required
              />
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded-lg text-sm shadow-lg shadow-blue-600/30">
              Iniciar Sesión
            </button>
          </form>

          <div className="border-t border-slate-700/60 pt-4 text-xs text-slate-400 space-y-1">
            <p className="font-semibold text-slate-300">Cuentas de Prueba:</p>
            <p>🛡️ Admin: <code className="text-blue-300">admin@duoc.cl</code> / <code className="text-slate-300">admin</code></p>
            <p>🎓 Líder: <code className="text-blue-300">lider@duoc.cl</code> / <code className="text-slate-300">lider</code></p>
            <p>👤 Alumno: <code className="text-blue-300">alumno@duoc.cl</code> / <code className="text-slate-300">alumno</code></p>
          </div>
        </div>
      </div>
    );
  }

  const activeRole = userSession.rol;

  // KPIs
  const totalActivos = items.length;
  const totalPrestados = items.filter((i) => i.estado === 'PRESTADO').length;
  const totalMantenimiento = items.filter((i) => i.estado === 'MANTENIMIENTO').length;
  const totalAlertas = filamentosBajos.length;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-900 text-slate-100">
      {/* Topbar Móvil */}
      <div className="md:hidden bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center">
        <div>
          <h1 className="text-lg font-bold text-blue-400">CITT Stock</h1>
          <p className="text-xs text-slate-400">Duoc UC • Pañol Digital</p>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 rounded bg-slate-700 text-slate-200 text-xl">☰</button>
      </div>

      {/* Sidebar */}
      <aside className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:block w-full md:w-64 bg-slate-800 border-r border-slate-700 p-6 flex flex-col justify-between`}>
        <div className="space-y-6">
          <div className="hidden md:block border-b border-slate-700 pb-4">
            <h1 className="text-xl font-bold text-blue-400">CITT Stock</h1>
            <p className="text-xs text-slate-400">Duoc UC • Pañol Digital</p>
          </div>

          <nav className="space-y-2">
            <button onClick={() => { setActiveTab('STOCK'); setIsMobileMenuOpen(false); }} className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition ${activeTab === 'STOCK' ? 'bg-blue-600 text-white' : 'hover:bg-slate-700 text-slate-300'}`}>📦 Catálogo y Stock</button>
            <button onClick={() => { setActiveTab('SOLICITUDES'); setIsMobileMenuOpen(false); }} className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition flex justify-between items-center ${activeTab === 'SOLICITUDES' ? 'bg-blue-600 text-white' : 'hover:bg-slate-700 text-slate-300'}`}>
              <span>📌 Solicitudes</span>
              {solicitudes.filter((s) => s.estado === 'PENDIENTE').length > 0 && <span className="bg-amber-500 text-slate-900 text-xs px-2 py-0.5 rounded-full font-bold">{solicitudes.filter((s) => s.estado === 'PENDIENTE').length}</span>}
            </button>
            <button onClick={() => { setActiveTab('FILAMENTO'); setIsMobileMenuOpen(false); }} className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition ${activeTab === 'FILAMENTO' ? 'bg-blue-600 text-white' : 'hover:bg-slate-700 text-slate-300'}`}>🧵 Filamento 3D (g/kg)</button>
            <button onClick={() => { setActiveTab('MANTENIMIENTO'); setIsMobileMenuOpen(false); }} className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition ${activeTab === 'MANTENIMIENTO' ? 'bg-blue-600 text-white' : 'hover:bg-slate-700 text-slate-300'}`}>🛠️ Mantenimiento (OT)</button>
            <button onClick={() => { setActiveTab('ALERTAS'); setIsMobileMenuOpen(false); }} className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition flex justify-between items-center ${activeTab === 'ALERTAS' ? 'bg-blue-600 text-white' : 'hover:bg-slate-700 text-slate-300'}`}>
              <span>⚠️ Alertas</span>
              {filamentosBajos.length > 0 && <span className="bg-rose-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">{filamentosBajos.length}</span>}
            </button>
          </nav>
        </div>

        <div className="bg-slate-900 p-3 rounded-lg border border-slate-700 space-y-2 mt-6 md:mt-0">
          <div>
            <p className="text-xs text-slate-400">Usuario Autenticado:</p>
            <p className="text-xs text-white font-bold truncate">{userSession.nombre}</p>
            <span className="text-[10px] bg-blue-900/60 text-blue-300 border border-blue-700 px-1.5 py-0.5 rounded uppercase font-semibold">{userSession.rol}</span>
          </div>
          <button onClick={handleLogout} className="w-full bg-rose-900/50 hover:bg-rose-800 border border-rose-700 text-rose-200 text-xs py-1.5 rounded">Cerrar Sesión</button>
        </div>
      </aside>

      {/* Contenido Principal */}
      <main className="flex-1 p-8 overflow-y-auto">
       <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 mb-6 border-b border-slate-800">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              {activeTab === 'STOCK' && '📦 Gestión de Activos e Inventario'}
              {activeTab === 'SOLICITUDES' && '📌 Solicitudes y Registro por Escuela'}
              {activeTab === 'FILAMENTO' && '🧵 Módulo Especial: Consumibles y Filamento 3D'}
              {activeTab === 'MANTENIMIENTO' && '🛠️ Gestión de Órdenes de Trabajo (OT)'}
              {activeTab === 'ALERTAS' && '⚠️ Centro de Alertas y Stock Crítico'}
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Perfil en uso: <span className="text-blue-400 font-semibold">{activeRole}</span>
            </p>
          </div>

          {/* Tarjeta de Logos Institucionales Integrada */}
          <div className="flex items-center gap-4 bg-slate-800/80 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-700/80 shadow-xl self-end sm:self-auto">
            <div className="bg-white p-1.5 rounded-lg flex items-center justify-center">
              <img 
                src="/duoc-logo.png" 
                alt="Duoc UC" 
                className="h-6 object-contain" 
              />
            </div>
            <div className="h-6 w-[1px] bg-slate-700"></div>
            <div className="flex items-center gap-2">
              <img 
                src="/citt-logo.png" 
                alt="CITT" 
                className="h-7 w-7 object-contain drop-shadow" 
              />
              <span className="text-xs font-black tracking-wider text-slate-200 uppercase"></span>
            </div>
          </div>
        </header>

        {/* Dashboard KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl flex flex-col justify-between">
            <p className="text-xs text-slate-400 font-semibold">Total Activos</p>
            <p className="text-2xl font-black text-blue-400 mt-1">{totalActivos}</p>
          </div>
          <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl flex flex-col justify-between">
            <p className="text-xs text-slate-400 font-semibold">En Préstamo</p>
            <p className="text-2xl font-black text-amber-400 mt-1">{totalPrestados}</p>
          </div>
          <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl flex flex-col justify-between">
            <p className="text-xs text-slate-400 font-semibold">En Mantenimiento (OT)</p>
            <p className="text-2xl font-black text-indigo-400 mt-1">{totalMantenimiento}</p>
          </div>
          <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl flex flex-col justify-between">
            <p className="text-xs text-slate-400 font-semibold">Stock Crítico</p>
            <p className="text-2xl font-black text-rose-400 mt-1">{totalAlertas}</p>
          </div>
        </div>

        {/* PESTAÑA 1: CATÁLOGO */}
        {activeTab === 'STOCK' && (
          <div className="space-y-8">
            {activeRole === 'ADMINISTRADOR' && (
              <form onSubmit={handleSubmit} className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-4">
                <h3 className="text-lg font-semibold text-slate-200">Registrar Nuevo Activo o Consumible</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Categoría del Equipo</label>
                    <select
                      value={form.categoria}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      className="w-full p-2 rounded bg-slate-900 border border-slate-700 text-sm"
                    >
                      <option value="Computadores">Computadores (EQ-CITT-)</option>
                      <option value="Impresoras 3D">Impresoras 3D (IM-CITT-)</option>
                      <option value="Filamentos / Consumibles">Filamentos (3D-CITT-)</option>
                      <option value="Herramientas">Herramientas (TA-CITT-)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Código de Serie (Autogenerado)</label>
                    <input
                      type="text"
                      value={form.codigoSerie}
                      onChange={(e) => setForm({ ...form, codigoSerie: e.target.value })}
                      className="w-full p-2 rounded bg-slate-900 border border-slate-700 text-sm font-mono text-blue-300 font-bold"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Nombre del Activo</label>
                    <input
                      type="text"
                      placeholder="Ej: Laptop Lenovo / Filamento PLA"
                      value={form.nombre}
                      onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                      className="w-full p-2 rounded bg-slate-900 border border-slate-700 text-sm"
                      required
                    />
                  </div>

                  <input
                    type="text"
                    placeholder="Ubicación / Casillero (ej: Rack nivel 2)"
                    value={form.ubicacion}
                    onChange={(e) => setForm({ ...form, ubicacion: e.target.value })}
                    className="p-2 rounded bg-slate-900 border border-slate-700 text-sm"
                  />

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

                  <input
                    type="text"
                    placeholder="Comentario / Nota (ej: Batería mala)"
                    value={form.descripcion}
                    onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                    className="p-2 rounded bg-slate-900 border border-slate-700 text-sm"
                  />

                  {form.esConsumible && (
                    <input
                      type="number"
                      placeholder="Gramos Iniciales (10000 g = 10 kg)"
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
                    <th className="p-2">QR</th>
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
                      <td className="p-2">
                        <button
                          onClick={() => setQrItem(item)}
                          className="p-1.5 bg-slate-900 hover:bg-slate-700 rounded border border-slate-700 text-xs text-blue-300 font-semibold"
                        >
                          📱 Ver QR
                        </button>
                      </td>
                      <td className="p-2 font-mono text-blue-300 font-bold">{item.codigoSerie}</td>
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
                      <td className="p-2 text-slate-300 text-xs italic">{item.descripcion || '-'}</td>
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
                            <button onClick={() => setOtItem(item)} className="bg-amber-600 px-2 py-1 rounded text-xs">Crear OT</button>
                            <button onClick={() => setEditingItem(item)} className="bg-indigo-600 px-2 py-1 rounded text-xs">Editar</button>
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
            <h3 className="text-lg font-semibold text-amber-300">📌 Registro e Historial de Solicitudes por Escuela</h3>
            {solicitudes.length === 0 ? (
              <p className="text-slate-400 text-sm">No hay solicitudes registradas.</p>
            ) : (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-400">
                    <th className="p-2">Equipo</th>
                    <th className="p-2">Solicitante</th>
                    <th className="p-2">Escuela Duoc UC</th>
                    <th className="p-2">Fecha</th>
                    <th className="p-2">Estado</th>
                    <th className="p-2 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {solicitudes.map((sol) => (
                    <tr key={sol.id} className="border-b border-slate-700/50">
                      <td className="p-2 font-medium">{sol.itemNombre} ({sol.codigoSerie})</td>
                      <td className="p-2 text-amber-200 font-bold">{sol.solicitanteNombre}</td>
                      <td className="p-2 text-blue-300 font-medium">{sol.escuela}</td>
                      <td className="p-2 text-slate-400">{sol.fecha}</td>
                      <td className="p-2">
                        <span className="px-2 py-0.5 text-xs rounded border bg-amber-900/60 text-amber-300 border-amber-700">
                          {sol.estado}
                        </span>
                      </td>
                      <td className="p-2 text-center space-x-2">
                        {(activeRole === 'ADMINISTRADOR' || activeRole === 'ALUMNO_LIDER') && sol.estado === 'PENDIENTE' && (
                          <button onClick={() => handleApproveRequest(sol)} className="bg-emerald-600 px-2 py-1 rounded text-xs font-bold">
                            Aprobar Préstamo
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

        {/* PESTAÑA 4: MANTENIMIENTO OT */}
        {activeTab === 'MANTENIMIENTO' && (
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-4">
            <h3 className="text-lg font-semibold text-amber-300">🛠️ Registro de Mantenimiento Preventivo y Correctivo (OT)</h3>
            {ordenesTrabajo.length === 0 ? (
              <p className="text-slate-400 text-sm">No hay Órdenes de Trabajo (OT) activas.</p>
            ) : (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-400">
                    <th className="p-2">Código</th>
                    <th className="p-2">Equipo</th>
                    <th className="p-2">Tipo OT</th>
                    <th className="p-2">Responsable</th>
                    <th className="p-2">Estado OT</th>
                    <th className="p-2">Diagnóstico</th>
                    <th className="p-2 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {ordenesTrabajo.map((ot) => (
                    <tr key={ot.id} className="border-b border-slate-700/50">
                      <td className="p-2 font-mono text-blue-300 font-bold">{ot.codigoSerie}</td>
                      <td className="p-2 font-medium">{ot.equipoNombre}</td>
                      <td className="p-2 font-bold text-amber-300">{ot.tipo}</td>
                      <td className="p-2 text-slate-300">{ot.responsable}</td>
                      <td className="p-2">
                        <select
                          value={ot.estadoOT}
                          onChange={(e) => handleUpdateOTState(ot.id, e.target.value as OrdenTrabajo['estadoOT'])}
                          className={`p-1 rounded text-xs border font-semibold ${
                            ot.estadoOT === 'Finalizada'
                              ? 'bg-emerald-900/80 text-emerald-300 border-emerald-700'
                              : ot.estadoOT === 'En diagnóstico'
                              ? 'bg-amber-900/80 text-amber-300 border-amber-700'
                              : 'bg-blue-900/80 text-blue-300 border-blue-700'
                          }`}
                        >
                          <option value="En proceso">En proceso</option>
                          <option value="En diagnóstico">En diagnóstico</option>
                          <option value="Finalizada">Finalizada (Completada)</option>
                        </select>
                      </td>
                      <td className="p-2 text-slate-300 text-xs italic">{ot.comentario}</td>
                      <td className="p-2 text-center">
                        {ot.estadoOT !== 'Finalizada' && (
                          <button
                            onClick={() => handleUpdateOTState(ot.id, 'Finalizada')}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-2 py-1 rounded font-bold"
                          >
                            ✅ Marcar Completo
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

        {/* PESTAÑA 5: ALERTAS */}
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

      {/* Modal QR */}
      {qrItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-sm space-y-4 text-center">
            <h3 className="text-lg font-bold text-slate-100">Código QR del Activo</h3>
            <p className="text-xs text-slate-400">{qrItem.nombre} (<span className="text-blue-300 font-mono">{qrItem.codigoSerie}</span>)</p>
            <div className="bg-white p-4 rounded-xl flex justify-center inline-block">
              <QRCodeSVG value={qrItem.codigoSerie} size={160} />
            </div>
            <button onClick={() => setQrItem(null)} className="w-full bg-slate-700 py-2 rounded text-xs text-slate-200">Cerrar</button>
          </div>
        </div>
      )}

      {/* Modal Crear OT */}
      {otItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-md space-y-4">
            <h3 className="text-lg font-bold text-slate-100">Generar OT de Mantenimiento</h3>
            <form onSubmit={handleCreateOT} className="space-y-3">
              <select value={formOT.tipo} onChange={(e) => setFormOT({ ...formOT, tipo: e.target.value as any })} className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-sm text-white">
                <option value="PREVENTIVO">Mantenimiento Preventivo</option>
                <option value="CORRECTIVO">Mantenimiento Correctivo</option>
              </select>
              <input type="text" placeholder="Técnico / Responsable" value={formOT.responsable} onChange={(e) => setFormOT({ ...formOT, responsable: e.target.value })} className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-sm text-white" required />
              <textarea placeholder="Diagnóstico inicial / motivo" value={formOT.comentario} onChange={(e) => setFormOT({ ...formOT, comentario: e.target.value })} className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-sm text-white" required />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setOtItem(null)} className="px-3 py-1.5 bg-slate-700 rounded text-xs">Cancelar</button>
                <button type="submit" className="px-3 py-1.5 bg-amber-600 rounded text-xs font-bold text-white">Generar OT</button>
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

              <div>
                <label className="text-xs text-slate-400 block mb-1">Escuela Asociada (Obligatorio)</label>
                <select
                  value={escuelaSeleccionada}
                  onChange={(e) => setEscuelaSeleccionada(e.target.value)}
                  className="w-full p-2 rounded bg-slate-900 border border-slate-700 text-white text-sm"
                >
                  {ESCUELAS_DUOC.map((esc) => (
                    <option key={esc} value={esc}>{esc}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-3">
                <button type="button" onClick={() => setRequestItem(null)} className="px-4 py-2 bg-slate-700 rounded text-xs">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded font-semibold text-xs">Enviar Solicitud</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Descuento Filamento */}
      {filamentItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-md space-y-4">
            <h3 className="text-xl font-bold text-slate-100">Descontar Filamento Usado</h3>
            <form onSubmit={handleDiscountFilament} className="space-y-4">
              <input
                type="number"
                value={descuentoGramos}
                onChange={(e) => setDescuentoGramos(parseFloat(e.target.value))}
                className="w-full p-2 rounded bg-slate-900 border border-slate-700 text-white text-sm"
                required
              />
              <div className="flex justify-end space-x-3">
                <button type="button" onClick={() => setFilamentItem(null)} className="px-4 py-2 bg-slate-700 rounded text-xs">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 rounded text-xs font-semibold">Aplicar Descuento</button>
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
              <input
                type="text"
                value={editingItem.nombre}
                onChange={(e) => setEditingItem({ ...editingItem, nombre: e.target.value })}
                className="w-full p-2 rounded bg-slate-900 border border-slate-700 text-white"
                required
              />
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
              <div className="flex justify-end space-x-3">
                <button type="button" onClick={() => setEditingItem(null)} className="px-4 py-2 bg-slate-700 rounded text-xs">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 rounded text-xs font-semibold">Guardar Cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Préstamo */}
      {loanItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-md space-y-4">
            <h3 className="text-xl font-bold text-slate-100">Registrar Préstamo</h3>
            <form onSubmit={handleConfirmLoan} className="space-y-4">
              <input
                type="text"
                placeholder="Ej: Juan Pérez (20.123.456-7)"
                value={prestadoAInput}
                onChange={(e) => setPrestadoAInput(e.target.value)}
                className="w-full p-2 rounded bg-slate-900 border border-slate-700 text-white text-sm"
                required
              />
              <div className="flex justify-end space-x-3">
                <button type="button" onClick={() => setLoanItem(null)} className="px-4 py-2 bg-slate-700 rounded text-xs">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 rounded text-xs font-semibold">Confirmar Préstamo</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}