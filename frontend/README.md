# CITT Stock – Frontend 🖥️

Interfaz web de **CITT Stock**, el sistema de inventario y trazabilidad de activos del Centro de Innovación y Transferencia Tecnológica (CITT) – Duoc UC Sede San Bernardo.

Esta carpeta contiene únicamente el cliente web. La API y la base de datos están en [`../backend`](../backend/README.md) y [`../FASE 2/database`](../FASE%202/database).

---

## 🛠️ Tecnologías

- **Next.js** (App Router) con **React** y **TypeScript**
- **Tailwind CSS** para los estilos
- **qrcode.react** para la generación de códigos QR
- Iconos SVG integrados en el código (sin dependencias adicionales)

---

## 🚀 Instalación y Ejecución

### Prerrequisitos

- Node.js v18 o superior
- El **backend** corriendo en <http://localhost:3001> (ver [README del backend](../backend/README.md))

### Pasos

```bash
# Desde la raíz del repositorio
cd frontend

# Instalar dependencias
npm install

# Iniciar el servidor de desarrollo
npm run dev
```

La aplicación queda disponible en <http://localhost:3000>.

> **Importante:** ejecuta `npm install` dentro de la carpeta `frontend`, no en la raíz del repositorio.

Para generar la versión de producción:

```bash
npm run build
npm run start
```

---

## 📂 Estructura del Proyecto

```text
frontend/
├── public/
│   ├── duoc-logo.png        # Logo Duoc UC (cabecera)
│   └── citt-logo.png        # Logo CITT (cabecera)
├── src/
│   ├── app/
│   │   └── page.tsx         # Aplicación principal: login, catálogo, solicitudes,
│   │                        # filamento 3D, mantenimiento (OT) y alertas
│   └── services/
│       └── api.ts           # Comunicación con la API REST (getItems, createItem, updateItem)
├── package.json
└── README.md
```

---

## 🧭 Módulos de la Aplicación

| Módulo | Descripción |
| --- | --- |
| **Catálogo y Stock** | Tabla de activos con búsqueda, filtro por estado, códigos QR, alta de nuevos activos y exportación a Excel. Las tarjetas resumen (Total, En Préstamo, En Mantenimiento, Stock Crítico) filtran la tabla al hacer clic. |
| **Solicitudes** | Registro de solicitudes por escuela y aprobación por parte de Administrador o Alumno Líder. |
| **Filamento 3D (g/kg)** | Control de consumibles: el stock se muestra en kilogramos y el descuento se realiza en gramos, con barra de progreso y marca de stock mínimo. |
| **Mantenimiento (OT)** | Órdenes de Trabajo preventivas y correctivas con los estados *En proceso*, *En diagnóstico* y *Finalizada*. |
| **Alertas** | Listado de consumibles bajo el stock mínimo. |

---

## 👥 Permisos por Rol

| Acción | Administrador | Alumno Líder | Usuario Global |
| --- | :---: | :---: | :---: |
| Ver catálogo y stock | ✅ | ✅ | ✅ |
| Registrar nuevo activo | ✅ | – | – |
| Prestar / Devolver | ✅ | ✅ | – |
| Descontar filamento | ✅ | ✅ | – |
| Solicitar un equipo | – | – | ✅ |
| Aprobar solicitudes | ✅ | ✅ | – |
| Crear OT, editar, dar de baja | ✅ | – | – |
| Exportar inventario a Excel | ✅ | – | – |

---

## 🔑 Cuentas de Prueba

En la pantalla de inicio de sesión, el botón **"Ver cuentas demo"** muestra las cuentas y permite rellenar el formulario con un clic.

| Rol | Correo | Contraseña |
| --- | --- | --- |
| Administrador | `admin@duoc.cl` | `admin` |
| Alumno Líder | `lider@duoc.cl` | `lider` |
| Usuario Global | `alumno@duoc.cl` | `alumno` |

> Cuentas solo para desarrollo y demostración.

---

## 📏 Reglas de Negocio Implementadas en la Interfaz

**Codificación automática de activos.** El código se genera según la categoría, toma el siguiente número libre y no se puede editar manualmente.

| Categoría | Prefijo |
| --- | --- |
| Mobiliario | `IM-CITT-` |
| 3D | `3D-CITT-` |
| Talleres | `TA-CITT-` |
| Equipamiento | `EQ-CITT-` |

**Dar de baja.** Los activos dañados o inutilizables no se eliminan. El Administrador los da de baja con confirmación y motivo obligatorio; quedan con estado `DEBAJA` y el motivo se guarda en su comentario.

**Consumibles.** El stock se almacena en gramos y se muestra en kilogramos. Un descuento de 50 g sobre 10 kg deja el stock en 9,95 kg. La barra de progreso toma como referencia un rollo de 10 kg (constante `CAPACIDAD_REF_G` en `page.tsx`).

---

## 🗺️ Pendientes

- Formulario de movimientos con fecha de retorno obligatoria en préstamos y devoluciones, y opción *Pedido* sin fecha.
- Selector de casilleros con estado *Ocupado / Disponible* y opción *Sin Casillero*.
- Recepción de stock para sumar existencias a un activo ya registrado.
- Persistir solicitudes y órdenes de trabajo en el backend (hoy se mantienen en memoria del navegador).
- Reemplazar el inicio de sesión de demostración por la autenticación del backend.

---

## 🤝 Equipo

- Jean García — Líder de Proyecto / Desarrollador Principal

*Proyecto Capstone 2026-2 – Incubadora · Duoc UC Sede San Bernardo*
