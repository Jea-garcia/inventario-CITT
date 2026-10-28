Markdown# CITT Stock - Backend API 🚀

Servidor API REST y capa de persistencia para el sistema de gestión de inventario y trazabilidad de activos del Centro de Innovación y Transferencia Tecnológica (CITT) – Duoc UC Sede San Bernardo.

---

## 📌 Descripción General

Este directorio contiene el código del **Backend** de CITT Stock. Se encarga de centralizar las reglas de negocio, procesar los flujos de préstamos temporales, devoluciones, registro de Órdenes de Trabajo (OT) para mantenimiento, conversión matemática de filamento 3D (kg a g) y administrar la seguridad mediante PostgreSQL con aislamiento Multi-Tenant (Row Level Security / RLS).

---

## 🛠️ Tecnologías y Arquitectura

- **Framework Principal:** NestJS (Node.js con TypeScript)
- **Base de Datos:** PostgreSQL con Row Level Security (RLS) e identificadores `UUID v4`.
- **ORM / Conexión:** TypeORM
- **Autenticación y Roles:** JWT con control RBAC (`ADMINISTRADOR`, `ALUMNO_LIDER`, `USUARIO_GLOBAL`).
- **Documentación de API:** Swagger API Docs (`/api`).

---

## 🚀 Guía de Instalación y Ejecución Local

1. **Ubicarse en el directorio backend e instalar dependencias:**
   ```bash
   cd backend
   npm install
---

### 📄 2. Para la carpeta `frontend/README.md`

```markdown
# CITT Stock - Frontend Web 🎨

Interfaz gráfica web, responsive e institucional para la plataforma de control de inventario y pañol del Centro de Innovación y Transferencia Tecnológica (CITT) – Duoc UC Sede San Bernardo.

---

## 📌 Descripción General

Este directorio contiene la aplicación cliente **Frontend** de CITT Stock. Proporciona un Dashboard con métricas clave (KPIs) en tiempo real, catálogo interactivo con autogeneración de códigos por categoría (`EQ-CITT-`, `IM-CITT-`, `3D-CITT-`, `TA-CITT-`), generación y visualización de códigos QR, módulo de solicitudes por Escuela de Duoc UC y gestión del flujo de Órdenes de Trabajo (OT).

---

## 🛠️ Tecnologías Utilizadas

- **Framework Principal:** Next.js (React con TypeScript)
- **Estilos & UI:** Tailwind CSS, Shadcn UI, Lucide Icons
- **Generación QR:** `qrcode.react`
- **Consumo de API:** Fetch API / Axios conectado con la API REST de NestJS.

---

## 🚀 Guía de Instalación y Ejecución Local

1. **Ubicarse en el directorio frontend e instalar dependencias:**
   ```bash
   cd frontend
   npm install
Configurar Variables de Entorno (.env.local):Fragmento de códigoNEXT_PUBLIC_API_URL=http://localhost:3001
Iniciar servidor de desarrollo:Bashnpm run dev
Aplicación disponible en: http://localhost:3000🔐 Cuentas de Prueba (Demo Local)RolCorreo InstitucionalContraseñaPermisosAdministradoradmin@duoc.cladminControl total del sistema, gestión de OTs y edición.Alumno Líderlider@duoc.clliderAprobación de solicitudes, préstamos y devoluciones.Usuario Globalalumno@duoc.clalumnoSolicitudes presenciales y consulta de catálogo.👥 Equipo del ProyectoLíder de Proyecto / Desarrollador Principal: Jean GarcíaContraparte Cliente: Paz Constanza Morales Saavedra — Representante CITT / Duoc UCDocente Guía: Fabián Alcántara Guajardo
---

### 🔄 Subir los cambios a GitHub

Guarda los archivos en sus respectivas carpetas y ejecuta en tu terminal para sincronizar el repositorio:

```powershell
git add .
git commit -m "docs: separados readmes individuales para backend y frontend creados por Jean Garcia"
git push origin main
