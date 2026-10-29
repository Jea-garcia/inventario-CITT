'use client';

import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Package,
  ClipboardList,
  Printer,
  Wrench,
  AlertTriangle,
  Plus,
  MoreHorizontal,
  QrCode,
  Download,
  Search,
  Shield,
  GraduationCap,
  User,
  Users,
  LogOut,
  Menu,
  X,
  Check,
  CheckCircle2,
  Info,
  Pencil,
  Archive,
  Scissors,
  KeyRound,
  UserX,
  UserCheck,
  type LucideIcon,
} from 'lucide-react';
import { getItems, createItem, updateItem, Item } from '@/services/api';

type UserRole = 'ADMINISTRADOR' | 'ALUMNO_LIDER' | 'USUARIO_GLOBAL';
type Tab = 'STOCK' | 'SOLICITUDES' | 'FILAMENTO' | 'MANTENIMIENTO' | 'ALERTAS' | 'USUARIOS';

interface UserSession {
  nombre: string;
  email: string;
  rol: UserRole;
}

interface UsuarioGestion {
  id: string;
  nombre: string;
  email: string;
  rol: UserRole;
  escuela: string;
  estado: 'ACTIVO' | 'INACTIVO';
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

// Categorías y prefijos oficiales
const CATEGORIAS = [
  { nombre: 'Equipamiento', prefijo: 'EQ-CITT-' },
  { nombre: 'Mobiliario', prefijo: 'IM-CITT-' },
  { nombre: '3D', prefijo: '3D-CITT-' },
  { nombre: 'Talleres', prefijo: 'TA-CITT-' },
];

// Navegación lateral con iconos
const NAV: { tab: Tab; label: string; icon: LucideIcon; adminOnly?: boolean }[] = [
  { tab: 'STOCK', label: 'Catálogo y Stock', icon: Package },
  { tab: 'SOLICITUDES', label: 'Solicitudes', icon: ClipboardList },
  { tab: 'FILAMENTO', label: 'Filamento 3D (g/kg)', icon: Printer },
  { tab: 'MANTENIMIENTO', label: 'Mantenimiento (OT)', icon: Wrench },
  { tab: 'ALERTAS', label: 'Alertas', icon: AlertTriangle },
  { tab: 'USUARIOS', label: 'Gestión de Usuarios', icon: Users, adminOnly: true },
];

const TITULOS: Record<Tab, string> = {
  STOCK: 'Gestión de Activos e Inventario',
  SOLICITUDES: 'Solicitudes y Registro por Escuela',
  FILAMENTO: 'Módulo Especial: Consumibles y Filamento 3D',
  MANTENIMIENTO: 'Gestión de Órdenes de Trabajo (OT)',
  ALERTAS: 'Centro de Alertas y Stock Crítico',
  USUARIOS: 'Administración de Usuarios y Permisos',
};

// Cuentas demo
const CUENTAS_DEMO = [
  { rol: 'Administrador', email: 'admin@duoc.cl', pass: 'admin', icon: Shield },
  { rol: 'Alumno Líder', email: 'lider@duoc.cl', pass: 'lider', icon: GraduationCap },
  { rol: 'Usuario Global', email: 'alumno@duoc.cl', pass: 'alumno', icon: User },
];

const CAPACIDAD_REF_G = 10000;

const siguienteCodigo = (prefijo: string, lista: Item[]) => {
  const max = lista
    .filter((i) => i.codigoSerie.startsWith(prefijo))
    .reduce((m, i) => {
      const n = parseInt(i.codigoSerie.slice(prefijo.length), 10);
      return isNaN(n) ? m : Math.max(m, n);
    }, 0);
  return `${prefijo}${String(max + 1).padStart(3, '0')}`;
};

function BarraStock({ gramos, minimo }: { gramos: number; minimo: number }) {
  const pct = Math.min(100, Math.max(0, (gramos / CAPACIDAD_REF_G) * 100));
  const minPct = Math.min(100, (minimo / CAPACIDAD_REF_G) * 100);
  const color = gramos <= minimo ? 'bg-rose-500' : pct < 30 ? 'bg-amber-400' : 'bg-emerald-500';
  return (
    <div
      className="relative h-2 w-full bg-slate-700 rounded-full overflow-hidden"
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      <div className="absolute top-0 h-full w-px bg-white/70" style={{ left: `${minPct}%` }} />
    </div>
  );
}

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('STOCK');

  // Sesión y Rol
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showDemo, setShowDemo] = useState(false);

  // Menú Hamburguesa Móvil
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Módulo de Usuarios
  const [usuariosList, setUsuariosList] = useState<UsuarioGestion[]>([
    { id: 'usr-1', nombre: 'Paz Constanza Morales Saavedra', email: 'admin@duoc.cl', rol: 'ADMINISTRADOR', escuela: 'Informática y Telecomunicaciones', estado: 'ACTIVO' },
    { id: 'usr-2', nombre: 'Juan Pérez (Alumno Líder)', email: 'lider@duoc.cl', rol: 'ALUMNO_LIDER', escuela: 'Informática y Telecomunicaciones', estado: 'ACTIVO' },
    { id: 'usr-3', nombre: 'Estudiante Duoc UC', email: 'alumno@duoc.cl', rol: 'USUARIO_GLOBAL', escuela: 'Construcción', estado: 'ACTIVO' },
  ]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState<UsuarioGestion | null>(null);
  const [formUser, setFormUser] = useState({
    nombre: '',
    email: '',
    rol: 'USUARIO_GLOBAL' as UserRole,
    escuela: ESCUELAS_DUOC[0],
  });

  // Solicitudes
  const [solicitudes, setSolicitudes] = useState<SolicitudLocal[]>([]);
  const [requestItem, setRequestItem] = useState<Item | null>(null);
  const [solicitanteInput, setSolicitanteInput] = useState('');
  const [escuelaSeleccionada, setEscuelaSeleccionada] = useState(ESCUELAS_DUOC[0]);

  // Modal QR
  const [qrItem, setQrItem] = useState<Item | null>(null);

  // Mantenimiento OT
  const [ordenesTrabajo, setOrdenesTrabajo] = useState<OrdenTrabajo[]>([
    {
      id: 'ot-1',
      codigoSerie: 'CITT-LAP-02',
      equipoNombre: 'Notebook Lenovo',
      tipo: 'CORRECTIVO',
      estadoOT: 'En proceso',
      responsable: 'CITT',
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
  const [showNewModal, setShowNewModal] = useState(false);
  const [form, setForm] = useState({
    nombre: '',
    codigoSerie: 'EQ-CITT-001',
    categoria: 'Equipamiento',
    ubicacion: 'Casillero A-1',
    estado: 'DISPONIBLE' as Item['estado'],
    descripcion: '',
    esConsumible: false,
    cantidadGramos: 10000,
  });

  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [loanItem, setLoanItem] = useState<Item | null>(null);
  const [prestadoAInput, setPrestadoAInput] = useState('');

  // Dar de baja
  const [bajaItem, setBajaItem] = useState<Item | null>(null);
  const [motivoBaja, setMotivoBaja] = useState('');

  // Menú "⋯"
  const [rowMenu, setRowMenu] = useState<{ item: Item; top: number; left: number } | null>(null);

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

  useEffect(() => {
    setForm((f) => {
      const prefijo = CATEGORIAS.find((c) => c.nombre === f.categoria)?.prefijo ?? 'EQ-CITT-';
      return { ...f, codigoSerie: siguienteCodigo(prefijo, items) };
    });
  }, [items]);

  const handleCategoryChange = (cat: string) => {
    const prefijo = CATEGORIAS.find((c) => c.nombre === cat)?.prefijo ?? 'EQ-CITT-';
    setForm({ ...form, categoria: cat, codigoSerie: siguienteCodigo(prefijo, items) });
  };

  // LOGIN DINÁMICO
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const emailClean = loginEmail.toLowerCase().trim();

    // 1. Cuentas demo
    if (emailClean === 'admin@duoc.cl' && loginPass === 'admin') {
      setUserSession({ nombre: 'Administrador CITT', email: loginEmail, rol: 'ADMINISTRADOR' });
      return;
    } 
    if (emailClean === 'lider@duoc.cl' && loginPass === 'lider') {
      setUserSession({ nombre: 'Alumno Líder Pañol', email: loginEmail, rol: 'ALUMNO_LIDER' });
      return;
    } 
    if (emailClean === 'alumno@duoc.cl' && loginPass === 'alumno') {
      setUserSession({ nombre: 'Estudiante Duoc UC', email: loginEmail, rol: 'USUARIO_GLOBAL' });
      return;
    }

    // 2. Usuarios creados dinámicamente en el módulo
    const usuarioEncontrado = usuariosList.find(
      (u) => u.email.toLowerCase().trim() === emailClean
    );

    if (usuarioEncontrado) {
      if (usuarioEncontrado.estado === 'INACTIVO') {
        setLoginError('Esta cuenta se encuentra desactivada por el Administrador.');
        return;
      }

      // Permite la clave 'Duoc2026!' o cualquier clave de 4 o más caracteres
      if (loginPass === 'Duoc2026!' || loginPass.length >= 4) {
        setUserSession({
          nombre: usuarioEncontrado.nombre,
          email: usuarioEncontrado.email,
          rol: usuarioEncontrado.rol,
        });
        return;
      }
    }

    setLoginError('Credenciales incorrectas.');
  };

  const handleLogout = () => {
    setUserSession(null);
    setLoginEmail('');
    setLoginPass('');
    setShowDemo(false);
    setRowMenu(null);
  };

  // Funciones Módulo Usuarios
  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formUser.nombre || !formUser.email) return;

    if (editingUsuario) {
      setUsuariosList(
        usuariosList.map((u) =>
          u.id === editingUsuario.id ? { ...u, ...formUser } : u
        )
      );
      setEditingUsuario(null);
    } else {
      const nuevo: UsuarioGestion = {
        id: `usr-${Date.now()}`,
        ...formUser,
        estado: 'ACTIVO',
      };
      setUsuariosList([nuevo, ...usuariosList]);
    }

    setFormUser({ nombre: '', email: '', rol: 'USUARIO_GLOBAL', escuela: ESCUELAS_DUOC[0] });
    setShowUserModal(false);
  };

  const handleResetPassword = (u: UsuarioGestion) => {
    alert(`🔑 Contraseña restablecida exitosamente para el usuario ${u.nombre}.\n\nClave temporal asignada: Duoc2026!`);
  };

  const handleToggleStateUser = (u: UsuarioGestion) => {
    const nuevoEstado = u.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
    setUsuariosList(
      usuariosList.map((item) => (item.id === u.id ? { ...item, estado: nuevoEstado } : item))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre || !form.codigoSerie) return;
    try {
      await createItem(form);
      setForm({
        nombre: '',
        codigoSerie: 'EQ-CITT-001',
        categoria: 'Equipamiento',
        ubicacion: 'Casillero A-1',
        estado: 'DISPONIBLE',
        descripcion: '',
        esConsumible: false,
        cantidadGramos: 10000,
      });
      setShowNewModal(false);
      loadItems();
    } catch (err) {
      alert('Error guardando el activo');
    }
  };

  const handleConfirmBaja = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bajaItem || !motivoBaja.trim()) return;

    const fecha = new Date().toISOString().split('T')[0];
    const notaBaja = `[BAJA ${fecha}] ${motivoBaja.trim()}`;

    try {
      await updateItem(bajaItem.id, {
        estado: 'DEBAJA',
        prestadoA: '',
        descripcion: bajaItem.descripcion ? `${bajaItem.descripcion} | ${notaBaja}` : notaBaja,
      });
      setBajaItem(null);
      setMotivoBaja('');
      loadItems();
    } catch (err) {
      alert('Error al dar de baja el activo');
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

  const openRowMenu = (e: React.MouseEvent<HTMLButtonElement>, item: Item) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const MENU_W = 176;
    const MENU_H = 132;
    const top = rect.bottom + MENU_H + 8 > window.innerHeight ? rect.top - MENU_H - 4 : rect.bottom + 4;
    const left = Math.max(8, rect.right - MENU_W);
    setRowMenu({ item, top, left });
  };

  const filamentosBajos = items.filter(
    (i) => i.esConsumible && i.estado !== 'DEBAJA' && (i.cantidadGramos || 0) <= (i.stockMinimoGramos || 1000)
  );
  const idsCriticos = new Set(filamentosBajos.map((f) => f.id));

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.nombre.toLowerCase().includes(search.toLowerCase()) ||
      item.codigoSerie.toLowerCase().includes(search.toLowerCase()) ||
      item.categoria.toLowerCase().includes(search.toLowerCase()) ||
      (item.descripcion && item.descripcion.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus =
      statusFilter === 'TODOS' ||
      (statusFilter === 'VIGENTES' && item.estado !== 'DEBAJA') ||
      (statusFilter === 'CRITICO' && idsCriticos.has(item.id)) ||
      item.estado === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // LOGIN
  if (!userSession) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 w-full max-w-md space-y-6 shadow-2xl">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-black text-blue-400">CITT Stock</h1>
            <p className="text-xs text-slate-400">Sistema de Inventario • Duoc UC</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {loginError && (
              <div className="bg-rose-950/80 border border-rose-800 text-rose-300 p-3 rounded text-xs text-center">
                {loginError}
              </div>
            )}
            <div>
              <label className="text-xs text-slate-400 block mb-1">Correo Institucional</label>
              <input
                type="email"
                placeholder="correo@duoc.cl"
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

          <p className="text-[11px] text-center text-slate-500 italic">
            ¿Olvidaste tu contraseña? Solicita el restablecimiento al Administrador CITT.
          </p>

          <div className="border-t border-slate-700/60 pt-4 space-y-3">
            <button
              type="button"
              onClick={() => setShowDemo(!showDemo)}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 mx-auto"
            >
              <Info size={14} />
              {showDemo ? 'Ocultar cuentas demo' : 'Ver cuentas demo'}
            </button>

            {showDemo && (
              <div className="space-y-2">
                {CUENTAS_DEMO.map(({ rol, email, pass, icon: Icon }) => (
                  <button
                    key={email}
                    type="button"
                    onClick={() => {
                      setLoginEmail(email);
                      setLoginPass(pass);
                      setLoginError('');
                    }}
                    className="w-full flex items-center gap-3 p-2.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-blue-500 text-left"
                  >
                    <Icon size={16} className="text-blue-300 shrink-0" />
                    <span className="flex-1">
                      <span className="block text-xs font-semibold text-slate-200">{rol}</span>
                      <span className="block text-[11px] font-mono text-slate-400">{email} / {pass}</span>
                    </span>
                    <span className="text-[10px] text-slate-500">Usar</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // APP PRINCIPAL
  const activeRole = userSession.rol;
  const canManageLoans = activeRole === 'ADMINISTRADOR' || activeRole === 'ALUMNO_LIDER';
  const pendientes = solicitudes.filter((s) => s.estado === 'PENDIENTE').length;
  const ActiveIcon = NAV.find((n) => n.tab === activeTab)?.icon || Package;

  const totalActivos = items.filter((i) => i.estado !== 'DEBAJA').length;
  const totalPrestados = items.filter((i) => i.estado === 'PRESTADO').length;
  const totalMantenimiento = items.filter((i) => i.estado === 'MANTENIMIENTO').length;
  const totalAlertas = filamentosBajos.length;

  const kpis = [
    { key: 'VIGENTES', label: 'Total Activos', value: totalActivos, color: 'text-blue-400' },
    { key: 'PRESTADO', label: 'En Préstamo', value: totalPrestados, color: 'text-amber-400' },
    { key: 'MANTENIMIENTO', label: 'En Mantenimiento (OT)', value: totalMantenimiento, color: 'text-indigo-400' },
    { key: 'CRITICO', label: 'Stock Crítico', value: totalAlertas, color: 'text-rose-400' },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-900 text-slate-100">
      {/* Topbar Móvil */}
      <div className="md:hidden bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center">
        <div>
          <h1 className="text-lg font-bold text-blue-400">CITT Stock</h1>
          <p className="text-xs text-slate-400">Duoc UC • Pañol Digital</p>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Abrir menú"
          className="p-2 rounded bg-slate-700 text-slate-200"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:block w-full md:w-64 bg-slate-800 border-r border-slate-700 p-6 flex flex-col justify-between`}>
        <div className="space-y-6">
          <div className="hidden md:block border-b border-slate-700 pb-4">
            <h1 className="text-xl font-bold text-blue-400">CITT Stock</h1>
            <p className="text-xs text-slate-400">Duoc UC • Pañol Digital</p>
          </div>

          <nav className="space-y-2">
            {NAV.map(({ tab, label, icon: Icon, adminOnly }) => {
              if (adminOnly && activeRole !== 'ADMINISTRADOR') return null;
              const badge = tab === 'SOLICITUDES' ? pendientes : tab === 'ALERTAS' ? filamentosBajos.length : 0;
              return (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); setIsMobileMenuOpen(false); }}
                  className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition flex items-center gap-3 ${
                    activeTab === tab ? 'bg-blue-600 text-white' : 'hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  <Icon size={18} className="shrink-0" />
                  <span className="flex-1">{label}</span>
                  {badge > 0 && (
                    <span className={`${tab === 'ALERTAS' ? 'bg-rose-500 text-white' : 'bg-amber-500 text-slate-900'} text-xs px-2 py-0.5 rounded-full font-bold`}>
                      {badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="bg-slate-900 p-3 rounded-lg border border-slate-700 space-y-2 mt-6 md:mt-0">
          <div>
            <p className="text-xs text-slate-400">Usuario Autenticado:</p>
            <p className="text-xs text-white font-bold truncate">{userSession.nombre}</p>
            <span className="text-[10px] bg-blue-900/60 text-blue-300 border border-blue-700 px-1.5 py-0.5 rounded uppercase font-semibold">{userSession.rol}</span>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-1.5 bg-rose-900/50 hover:bg-rose-800 border border-rose-700 text-rose-200 text-xs py-1.5 rounded"
          >
            <LogOut size={14} /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Contenido Principal */}
      <main className="flex-1 p-8 overflow-y-auto min-w-0">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 mb-6 border-b border-slate-800">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <ActiveIcon size={24} className="text-blue-400 shrink-0" />
              {TITULOS[activeTab]}
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Perfil en uso: <span className="text-blue-400 font-semibold">{activeRole}</span>
            </p>
          </div>

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
            </div>
          </div>
        </header>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {kpis.map((k) => {
            const selected = activeTab === 'STOCK' && statusFilter === k.key;
            return (
              <button
                key={k.key}
                type="button"
                aria-pressed={selected}
                onClick={() => {
                  setActiveTab('STOCK');
                  setStatusFilter(k.key);
                  setSearch('');
                }}
                className={`bg-slate-800 border p-4 rounded-xl flex flex-col justify-between text-left transition ${
                  selected ? 'border-blue-500 ring-1 ring-blue-500' : 'border-slate-700 hover:border-slate-500'
                }`}
              >
                <p className="text-xs text-slate-400 font-semibold">{k.label}</p>
                <p className={`text-2xl font-black mt-1 ${k.color}`}>{k.value}</p>
              </button>
            );
          })}
        </div>

        {/* PESTAÑA 1: CATÁLOGO */}
        {activeTab === 'STOCK' && (
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-4">
            <div className="flex flex-col lg:flex-row justify-between gap-4">
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <div className="relative w-full sm:w-72">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Buscar por código, nombre, notas..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 pr-3 py-2 rounded bg-slate-900 border border-slate-700 text-sm w-full"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="p-2 rounded bg-slate-900 border border-slate-700 text-sm text-white"
                >
                  <option value="TODOS">Todos los estados</option>
                  <option value="VIGENTES">Activos vigentes (sin bajas)</option>
                  <option value="DISPONIBLE">DISPONIBLE</option>
                  <option value="PRESTADO">PRESTADO</option>
                  <option value="MANTENIMIENTO">MANTENIMIENTO</option>
                  <option value="CRITICO">STOCK CRÍTICO</option>
                  <option value="DEBAJA">DEBAJA</option>
                </select>
              </div>

              {activeRole === 'ADMINISTRADOR' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowNewModal(true)}
                    className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm px-3 py-2 rounded"
                  >
                    <Plus size={16} /> Nuevo activo
                  </button>
                  <button
                    onClick={handleExportCSV}
                    className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-600 text-sm px-3 py-2 rounded"
                  >
                    <Download size={16} /> Exportar Excel
                  </button>
                </div>
              )}
            </div>

            <div className="overflow-x-auto">
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
                  {loading && (
                    <tr>
                      <td colSpan={8} className="p-6 text-center text-slate-400 text-sm">Cargando inventario...</td>
                    </tr>
                  )}

                  {!loading && filteredItems.length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400 text-sm">
                        No hay activos que coincidan con el filtro.{' '}
                        <button
                          onClick={() => { setSearch(''); setStatusFilter('TODOS'); }}
                          className="text-blue-400 hover:underline"
                        >
                          Limpiar filtros
                        </button>
                      </td>
                    </tr>
                  )}

                  {filteredItems.map((item) => (
                    <tr key={item.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                      <td className="p-2">
                        <button
                          onClick={() => setQrItem(item)}
                          className="flex items-center gap-1 p-1.5 bg-slate-900 hover:bg-slate-700 rounded border border-slate-700 text-xs text-blue-300 font-semibold"
                        >
                          <QrCode size={14} /> Ver QR
                        </button>
                      </td>
                      <td className="p-2 font-mono text-blue-300 font-bold">{item.codigoSerie}</td>
                      <td className="p-2 font-medium">{item.nombre}</td>
                      <td className="p-2 text-slate-400">{item.ubicacion || 'Sin Casillero'}</td>
                      <td className="p-2">
                        {item.estado === 'DEBAJA' ? (
                          <span className="px-2 py-0.5 text-xs rounded border bg-rose-900/60 text-rose-300 border-rose-700">
                            DEBAJA
                          </span>
                        ) : item.esConsumible ? (
                          <div className="w-32 space-y-1">
                            <span className="text-amber-300 font-bold text-sm">
                              {((item.cantidadGramos || 0) / 1000).toFixed(2)} kg ({item.cantidadGramos} g)
                            </span>
                            <BarraStock gramos={item.cantidadGramos || 0} minimo={item.stockMinimoGramos || 1000} />
                          </div>
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
                      <td className="p-2">
                        {item.estado === 'DEBAJA' ? (
                          <span className="block text-center text-xs text-slate-500 italic">Dado de baja</span>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            {canManageLoans && !item.esConsumible && item.estado === 'DISPONIBLE' && (
                              <button onClick={() => setLoanItem(item)} className="bg-indigo-600 hover:bg-indigo-500 px-3 py-1 rounded text-xs font-semibold">Prestar</button>
                            )}
                            {canManageLoans && !item.esConsumible && item.estado === 'PRESTADO' && (
                              <button onClick={() => handleReturnLoan(item)} className="bg-emerald-600 hover:bg-emerald-500 px-3 py-1 rounded text-xs font-semibold">Devolver</button>
                            )}
                            {canManageLoans && item.esConsumible && (
                              <button onClick={() => setFilamentItem(item)} className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 px-3 py-1 rounded text-xs font-semibold">
                                <Scissors size={12} /> Descontar
                              </button>
                            )}
                            {activeRole === 'USUARIO_GLOBAL' && item.estado === 'DISPONIBLE' && !item.esConsumible && (
                              <button onClick={() => setRequestItem(item)} className="bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded text-xs font-semibold">Solicitar</button>
                            )}

                            {activeRole === 'ADMINISTRADOR' && (
                              <button
                                onClick={(e) => openRowMenu(e, item)}
                                aria-label="Más acciones"
                                className="p-1.5 rounded border border-slate-600 hover:bg-slate-700 text-slate-300"
                              >
                                <MoreHorizontal size={16} />
                              </button>
                            )}
                          </div>
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
            <h3 className="text-lg font-semibold text-amber-300 flex items-center gap-2">
              <ClipboardList size={20} /> Registro e Historial de Solicitudes por Escuela
            </h3>
            {solicitudes.length === 0 ? (
              <p className="text-slate-400 text-sm">No hay solicitudes registradas.</p>
            ) : (
              <div className="overflow-x-auto">
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
                          <span className={`px-2 py-0.5 text-xs rounded border ${
                            sol.estado === 'APROBADA'
                              ? 'bg-emerald-900/60 text-emerald-300 border-emerald-700'
                              : 'bg-amber-900/60 text-amber-300 border-amber-700'
                          }`}>
                            {sol.estado}
                          </span>
                        </td>
                        <td className="p-2 text-center space-x-2">
                          {canManageLoans && sol.estado === 'PENDIENTE' && (
                            <button onClick={() => handleApproveRequest(sol)} className="bg-emerald-600 hover:bg-emerald-500 px-3 py-1 rounded text-xs font-bold">
                              Aprobar Préstamo
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* PESTAÑA 3: FILAMENTO 3D */}
        {activeTab === 'FILAMENTO' && (
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-blue-300 flex items-center gap-2">
                <Printer size={20} /> Descuento Automático en Gramos (g) vs Kilogramos (kg)
              </h3>
              <p className="text-xs text-slate-400">Conversión automática: Ingrese en kg, el sistema descuenta en g para una impresión exacta.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {items.filter((i) => i.esConsumible && i.estado !== 'DEBAJA').map((fil) => {
                const gramos = fil.cantidadGramos || 0;
                const minimo = fil.stockMinimoGramos || 1000;
                const critico = gramos <= minimo;
                return (
                  <div key={fil.id} className="bg-slate-900 p-4 rounded-xl border border-slate-700 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-white">{fil.nombre}</h4>
                        <p className="text-xs text-slate-400">Código: {fil.codigoSerie}</p>
                      </div>
                      <span className={`text-xl font-black ${critico ? 'text-rose-400' : 'text-amber-400'}`}>
                        {(gramos / 1000).toFixed(2)} kg
                      </span>
                    </div>

                    <div className="space-y-1">
                      <BarraStock gramos={gramos} minimo={minimo} />
                      <div className="flex justify-between text-[11px] text-slate-500">
                        <span>0 kg</span>
                        <span>Mínimo: {minimo} g</span>
                        <span>{CAPACIDAD_REF_G / 1000} kg</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400">
                      Stock exacto: <strong className="text-slate-200">{gramos} g</strong>
                      {critico && <span className="ml-2 text-rose-400 font-semibold">Stock crítico</span>}
                    </p>

                    {canManageLoans && (
                      <button
                        onClick={() => setFilamentItem(fil)}
                        className="w-full flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs py-2 rounded"
                      >
                        <Scissors size={14} /> Descontar Impresión (Gramos)
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* PESTAÑA 4: MANTENIMIENTO OT */}
        {activeTab === 'MANTENIMIENTO' && (
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-4">
            <h3 className="text-lg font-semibold text-amber-300 flex items-center gap-2">
              <Wrench size={20} /> Registro de Mantenimiento Preventivo y Correctivo (OT)
            </h3>
            {ordenesTrabajo.length === 0 ? (
              <p className="text-slate-400 text-sm">No hay Órdenes de Trabajo (OT) activas.</p>
            ) : (
              <div className="overflow-x-auto">
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
                              className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-2 py-1 rounded font-bold"
                            >
                              <Check size={14} /> Marcar Completo
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* PESTAÑA 5: ALERTAS */}
        {activeTab === 'ALERTAS' && (
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-4">
            <h3 className="text-lg font-semibold text-rose-400 flex items-center gap-2">
              <AlertTriangle size={20} /> Alertas de Stock Crítico
            </h3>
            {filamentosBajos.length === 0 ? (
              <p className="flex items-center gap-2 text-slate-400 text-sm">
                <CheckCircle2 size={16} className="text-emerald-400" />
                Todos los consumibles están por encima del stock mínimo.
              </p>
            ) : (
              <div className="space-y-3">
                {filamentosBajos.map((f) => (
                  <div key={f.id} className="p-4 rounded-lg bg-rose-950/40 border border-rose-800/60 space-y-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-bold text-rose-200">{f.nombre} ({f.codigoSerie})</p>
                        <p className="text-xs text-slate-400">Stock actual: {f.cantidadGramos} g | Mínimo requerido: {f.stockMinimoGramos || 1000} g</p>
                      </div>
                      <span className="bg-rose-600 text-white text-xs px-2.5 py-1 rounded font-bold">STOCK CRÍTICO</span>
                    </div>
                    <BarraStock gramos={f.cantidadGramos || 0} minimo={f.stockMinimoGramos || 1000} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PESTAÑA 6: GESTIÓN DE USUARIOS (SOLO ADMINISTRADOR) */}
        {activeTab === 'USUARIOS' && activeRole === 'ADMINISTRADOR' && (
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-lg font-semibold text-blue-300 flex items-center gap-2">
                  <Users size={20} /> Administración de Usuarios y Accesos CITT
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Creación, edición de roles, reseteo de claves y deshabilitación de cuentas.</p>
              </div>

              <button
                onClick={() => {
                  setEditingUsuario(null);
                  setFormUser({ nombre: '', email: '', rol: 'USUARIO_GLOBAL', escuela: ESCUELAS_DUOC[0] });
                  setShowUserModal(true);
                }}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm px-3.5 py-2 rounded-lg shadow-lg shadow-blue-600/30"
              >
                <Plus size={16} /> Crear usuario
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-400">
                    <th className="p-2.5">Nombre / Usuario</th>
                    <th className="p-2.5">Correo / RUT</th>
                    <th className="p-2.5">Rol de Sistema</th>
                    <th className="p-2.5">Escuela</th>
                    <th className="p-2.5">Estado</th>
                    <th className="p-2.5 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {usuariosList.map((u) => (
                    <tr key={u.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                      <td className="p-2.5 font-bold text-white">{u.nombre}</td>
                      <td className="p-2.5 font-mono text-xs text-slate-300">{u.email}</td>
                      <td className="p-2.5">
                        <span className={`px-2 py-0.5 text-xs rounded border font-semibold ${
                          u.rol === 'ADMINISTRADOR' ? 'bg-purple-900/60 text-purple-300 border-purple-700' :
                          u.rol === 'ALUMNO_LIDER' ? 'bg-blue-900/60 text-blue-300 border-blue-700' :
                          'bg-slate-900 text-slate-300 border-slate-700'
                        }`}>
                          {u.rol}
                        </span>
                      </td>
                      <td className="p-2.5 text-xs text-slate-300">{u.escuela}</td>
                      <td className="p-2.5">
                        <span className={`px-2 py-0.5 text-xs rounded border font-semibold ${
                          u.estado === 'ACTIVO' ? 'bg-emerald-900/60 text-emerald-300 border-emerald-700' : 'bg-rose-900/60 text-rose-300 border-rose-700'
                        }`}>
                          {u.estado}
                        </span>
                      </td>
                      <td className="p-2.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleResetPassword(u)}
                            title="Resetear contraseña"
                            className="flex items-center gap-1 bg-amber-900/60 hover:bg-amber-800 border border-amber-700 text-amber-200 text-xs px-2.5 py-1 rounded"
                          >
                            <KeyRound size={12} /> Reset Clave
                          </button>

                          <button
                            onClick={() => {
                              setEditingUsuario(u);
                              setFormUser({ nombre: u.nombre, email: u.email, rol: u.rol, escuela: u.escuela });
                              setShowUserModal(true);
                            }}
                            title="Editar usuario"
                            className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded text-slate-200"
                          >
                            <Pencil size={13} />
                          </button>

                          <button
                            onClick={() => handleToggleStateUser(u)}
                            title={u.estado === 'ACTIVO' ? 'Desactivar usuario' : 'Activar usuario'}
                            className={`p-1.5 rounded ${
                              u.estado === 'ACTIVO' ? 'bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800' : 'bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-800'
                            }`}
                          >
                            {u.estado === 'ACTIVO' ? <UserX size={13} /> : <UserCheck size={13} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Menú "⋯" */}
      {rowMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setRowMenu(null)} />
          <div
            className="fixed z-50 w-44 bg-slate-800 border border-slate-600 rounded-lg shadow-2xl py-1"
            style={{ top: rowMenu.top, left: rowMenu.left }}
          >
            <button
              onClick={() => { setOtItem(rowMenu.item); setRowMenu(null); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-200 hover:bg-slate-700"
            >
              <Wrench size={14} /> Crear OT
            </button>
            <button
              onClick={() => { setEditingItem(rowMenu.item); setRowMenu(null); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-200 hover:bg-slate-700"
            >
              <Pencil size={14} /> Editar
            </button>
            <div className="my-1 border-t border-slate-700" />
            <button
              onClick={() => { setBajaItem(rowMenu.item); setRowMenu(null); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-300 hover:bg-rose-950/60"
            >
              <Archive size={14} /> Dar de baja
            </button>
          </div>
        </>
      )}

      {/* Modal Usuario (Crear / Editar) */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-100">
                {editingUsuario ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
              </h3>
              <button onClick={() => setShowUserModal(false)} className="text-slate-400 hover:text-slate-200">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Nombre Completo</label>
                <input
                  type="text"
                  placeholder="Ej: Pedro González"
                  value={formUser.nombre}
                  onChange={(e) => setFormUser({ ...formUser, nombre: e.target.value })}
                  className="w-full p-2.5 rounded bg-slate-900 border border-slate-700 text-white text-sm"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Correo Institucional / RUT</label>
                <input
                  type="email"
                  placeholder="usuario@duoc.cl"
                  value={formUser.email}
                  onChange={(e) => setFormUser({ ...formUser, email: e.target.value })}
                  className="w-full p-2.5 rounded bg-slate-900 border border-slate-700 text-white text-sm"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Rol de Acceso</label>
                <select
                  value={formUser.rol}
                  onChange={(e) => setFormUser({ ...formUser, rol: e.target.value as UserRole })}
                  className="w-full p-2.5 rounded bg-slate-900 border border-slate-700 text-white text-sm"
                >
                  <option value="USUARIO_GLOBAL">USUARIO_GLOBAL (Estudiante)</option>
                  <option value="ALUMNO_LIDER">ALUMNO_LIDER (Operador de Mesón)</option>
                  <option value="ADMINISTRADOR">ADMINISTRADOR (Acceso Total)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Escuela Asociada</label>
                <select
                  value={formUser.escuela}
                  onChange={(e) => setFormUser({ ...formUser, escuela: e.target.value })}
                  className="w-full p-2.5 rounded bg-slate-900 border border-slate-700 text-white text-sm"
                >
                  {ESCUELAS_DUOC.map((esc) => (
                    <option key={esc} value={esc}>{esc}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowUserModal(false)} className="px-4 py-2 bg-slate-700 rounded text-xs text-slate-300">
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-xs font-semibold text-white">
                  {editingUsuario ? 'Guardar Cambios' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Nuevo Activo */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-100">Registrar Nuevo Activo o Consumible</h3>
              <button
                onClick={() => setShowNewModal(false)}
                aria-label="Cerrar"
                className="p-1 rounded hover:bg-slate-700 text-slate-400"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Categoría del Equipo</label>
                  <select
                    value={form.categoria}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full p-2 rounded bg-slate-900 border border-slate-700 text-sm"
                  >
                    {CATEGORIAS.map((c) => (
                      <option key={c.nombre} value={c.nombre}>
                        {c.nombre} ({c.prefijo})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Código de Serie (Autogenerado)</label>
                  <input
                    type="text"
                    value={form.codigoSerie}
                    readOnly
                    className="w-full p-2 rounded bg-slate-900 border border-slate-700 text-sm font-mono text-blue-300 font-bold"
                    required
                  />
                </div>

                <div className="md:col-span-2">
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

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Ubicación / Casillero</label>
                  <input
                    type="text"
                    placeholder="Ej: Casillero A-1"
                    value={form.ubicacion}
                    onChange={(e) => setForm({ ...form, ubicacion: e.target.value })}
                    className="w-full p-2 rounded bg-slate-900 border border-slate-700 text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Estado inicial</label>
                  <select
                    value={form.estado}
                    onChange={(e) => setForm({ ...form, estado: e.target.value as Item['estado'] })}
                    className="w-full p-2 rounded bg-slate-900 border border-slate-700 text-sm text-white"
                  >
                    <option value="DISPONIBLE">DISPONIBLE</option>
                    <option value="PRESTADO">PRESTADO</option>
                    <option value="MANTENIMIENTO">MANTENIMIENTO</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs text-slate-400 block mb-1">Comentario / Nota</label>
                  <input
                    type="text"
                    placeholder="Ej: Batería mala"
                    value={form.descripcion}
                    onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                    className="w-full p-2 rounded bg-slate-900 border border-slate-700 text-sm"
                  />
                </div>

                <label className="flex items-center gap-2 text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={form.esConsumible}
                    onChange={(e) => setForm({ ...form, esConsumible: e.target.checked })}
                  />
                  Es consumible (se controla en kg / g)
                </label>

                {form.esConsumible && (
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Gramos iniciales (10000 g = 10 kg)</label>
                    <input
                      type="number"
                      value={form.cantidadGramos}
                      onChange={(e) => setForm({ ...form, cantidadGramos: parseFloat(e.target.value) })}
                      className="w-full p-2 rounded bg-slate-900 border border-slate-700 text-sm"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowNewModal(false)} className="px-4 py-2 bg-slate-700 rounded text-xs">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-xs font-semibold">Guardar Activo</button>
              </div>
            </form>
          </div>
        </div>
      )}

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
            <p className="text-sm text-slate-400">
              <span className="text-blue-300 font-mono">{filamentItem.codigoSerie}</span> · {filamentItem.nombre}
            </p>
            <form onSubmit={handleDiscountFilament} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Gramos a descontar</label>
                <input
                  type="number"
                  value={descuentoGramos}
                  onChange={(e) => setDescuentoGramos(parseFloat(e.target.value))}
                  className="w-full p-2 rounded bg-slate-900 border border-slate-700 text-white text-sm"
                  required
                />
              </div>
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

      {/* Modal Dar de Baja */}
      {bajaItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-md space-y-4">
            <h3 className="text-xl font-bold text-slate-100">Dar de baja activo</h3>
            <p className="text-sm text-slate-400">
              <span className="text-blue-300 font-mono">{bajaItem.codigoSerie}</span> · {bajaItem.nombre}
            </p>
            <p className="text-xs text-amber-300">
              El activo no se borra: queda con estado DEBAJA y registrado en el historial.
            </p>
            <form onSubmit={handleConfirmBaja} className="space-y-4">
              <textarea
                placeholder="Motivo de la baja (ej: dañado, inutilizable)"
                value={motivoBaja}
                onChange={(e) => setMotivoBaja(e.target.value)}
                className="w-full p-2 rounded bg-slate-900 border border-slate-700 text-white text-sm"
                required
              />
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => { setBajaItem(null); setMotivoBaja(''); }}
                  className="px-4 py-2 bg-slate-700 rounded text-xs"
                >
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-2 bg-rose-600 rounded text-xs font-semibold">Confirmar baja</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}