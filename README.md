# CITT Stock 📦

Plataforma web de gestión, control de inventario y trazabilidad de activos para el Centro de Innovación y Transferencia Tecnológica (CITT) – Duoc UC Sede San Bernardo.

---

## 📌 Descripción General

**CITT Stock** es una solución tecnológica integral desarrollada para optimizar la administración de activos, herramientas e insumos consumibles en el CITT de Duoc UC Sede San Bernardo. El sistema centraliza el control de inventario y automatiza los flujos de préstamos temporales, devoluciones y entregas definitivas, integrando generación de códigos QR para una trazabilidad precisa en tiempo real.

El proyecto nace de una problemática concreta: hasta ahora los insumos se prestaban y entregaban sin un registro automatizado, lo que generaba incertidumbre sobre los responsables y pérdidas frecuentes de activos.

---

## ✨ Características Principales

- 🔄 **Control de Movimientos Diferenciado:** Gestión de tres flujos clave:
  - **Préstamos:** Registro obligatorio de fecha límite de retorno y escuela asociada.
  - **Devoluciones:** Cierre de ciclo de préstamos con reintegración a casillero.
  - **Pedidos / Entregas Definitivas:** Para insumos consumibles (sin fecha de retorno).
- 🖨️ **Gestión de Consumibles (Filamento 3D):** Conversión automática entre unidades (ingreso de stock en kilogramos y descuento en gramos). Ejemplo: un pedido de 50 g sobre 10 kg deja el stock en 9,95 kg.
- 📍 **Organización por Casilleros:** Estado de disponibilidad en tiempo real (*Ocupado* / *Disponible*), con soporte para activos *"Sin Casillero / Sin ubicación fija"*.
- 🏷️ **Identificación vía Códigos QR:** Generación automática de códigos únicos según la categoría del activo (ver tabla de codificación).
- 🛠️ **Módulo de Mantenimiento:** Seguimiento de Órdenes de Trabajo (OT) preventivas y correctivas, con los estados *En proceso*, *En diagnóstico* y *Finalizada*.
- 🗃️ **Bajas con trazabilidad:** Los activos dañados o inutilizables no se eliminan: se dan de baja con confirmación y motivo, y quedan registrados en el historial.
- 📊 **Alertas y Reportes:** Alertas de stock crítico y exportación del inventario a Excel.

### Codificación de activos

Los códigos se generan automáticamente según la categoría y nunca se repiten:

| Categoría    | Prefijo     | Ejemplo      |
| ------------ | ----------- | ------------ |
| Mobiliario   | `IM-CITT-`  | `IM-CITT-001` |
| 3D           | `3D-CITT-`  | `3D-CITT-001` |
| Talleres     | `TA-CITT-`  | `TA-CITT-001` |
| Equipamiento | `EQ-CITT-`  | `EQ-CITT-001` |

---

## 👥 Roles y Permisos del Sistema

El sistema opera bajo un modelo de accesos jerárquicos:

| Rol | Descripción |
| --- | --- |
| **Administrador** | Control total del sistema: configuración, reportes, aprobaciones, mantenimiento y bajas. |
| **Alumno Líder (AL)** | Rol operativo en ventanilla: registra préstamos, devoluciones y entregas definitivas, y aprueba solicitudes presenciales de usuarios globales. |
| **Usuario Global** | Público general y estudiantes de la comunidad Duoc UC (~300 usuarios). Consulta el catálogo y realiza solicitudes de forma presencial, sujetas a la aprobación de un Administrador o Alumno Líder. |

---

## 🛠️ Tecnologías Utilizadas

El proyecto está construido bajo una arquitectura moderna y escalable, con soporte **Multi-Tenancy** (*Shared Database, Shared Schema* con *Row Level Security* / RLS):

- **Frontend:** Next.js (React), TypeScript, Tailwind CSS.
- **Backend:** NestJS (Node.js), TypeScript, TypeORM, Swagger API Docs.
- **Base de Datos:** PostgreSQL con Row Level Security (RLS) e identificadores UUID v4.
- **Infraestructura y Despliegue:** Docker, Docker Compose.

---

## 🏗️ Arquitectura de la Solución

```text
┌─────────────────────────────────────────────────────────┐
│                   CLIENTE / FRONTEND                    │
│            Next.js + TypeScript + Tailwind CSS          │
└────────────────────────────┬────────────────────────────┘
                             │  REST API (JWT)
                             ▼
┌─────────────────────────────────────────────────────────┐
│                   SERVIDOR / BACKEND                    │
│              NestJS + TypeScript + TypeORM              │
└────────────────────────────┬────────────────────────────┘
                             │  SQL / RLS (app.tenant_id)
                             ▼
┌─────────────────────────────────────────────────────────┐
│                BASE DE DATOS / DATABASE                 │
│          PostgreSQL Multi-Tenant (Shared Schema)        │
└─────────────────────────────────────────────────────────┘
```

---

## 🖼️ Capturas de Pantalla

| Inicio de sesión | Catálogo y stock |
| :---: | :---: |
| ![Inicio de sesión](docs/screenshots/login.png) | ![Catálogo y stock](docs/screenshots/catalogo.png) |

| Filamento 3D | Mantenimiento (OT) |
| :---: | :---: |
| ![Filamento 3D](docs/screenshots/filamento.png) | ![Mantenimiento](docs/screenshots/mantenimiento.png) |

---

## 🚀 Guía de Instalación y Ejecución Local

### Prerrequisitos

- Node.js (v18 o superior)
- PostgreSQL (v14 o superior) o Docker Desktop

### 1. Clonar el repositorio

```bash
git clone https://github.com/Jea-garcia/inventario-CITT.git
cd inventario-CITT
```

### 2. Configurar la base de datos

1. Crear una base de datos vacía en PostgreSQL llamada `citt_stock_db`.
2. Ejecutar los scripts SQL ubicados en `FASE 2/database/migrations/` en el siguiente orden:

   1. `001_add_inventory_fields.sql`
   2. `002_enable_tenant_rls.sql`
   3. `003_add_loan_quantity.sql`
   4. `004_complete_inventory_schema.sql`
   5. `005_authentication.sql`

3. Definir el identificador de la sede (tenant) antes de operar con el sistema:

   ```sql
   SET app.tenant_id = 'UUID_DE_LA_SEDE';
   ```

4. Verificar que las credenciales de conexión a PostgreSQL configuradas en el backend correspondan a la base de datos `citt_stock_db`.

### 3. Backend (NestJS)

```bash
# Desde la raíz del repositorio
cd backend

# Instalar dependencias
npm install

# Iniciar en modo desarrollo
npm run start:dev
```

- API disponible en: <http://localhost:3001>
- Documentación Swagger: <http://localhost:3001/api>

### 4. Frontend (Next.js)

Abrir una segunda terminal:

```bash
# Desde la raíz del repositorio
cd frontend

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

- Aplicación disponible en: <http://localhost:3000>

> **Importante:** ejecuta `npm install` dentro de cada carpeta (`backend` y `frontend`), no en la raíz del repositorio.

---

## 🔑 Cuentas de Prueba

Para evaluar el sistema en entorno de desarrollo, la pantalla de inicio de sesión incluye el botón **"Ver cuentas demo"**. Las credenciales son:

| Rol | Correo | Contraseña |
| --- | --- | --- |
| Administrador | `admin@duoc.cl` | `admin` |
| Alumno Líder | `lider@duoc.cl` | `lider` |
| Usuario Global | `alumno@duoc.cl` | `alumno` |

> Estas cuentas son solo para desarrollo y demostración.

---

## 📅 Metodología de Trabajo

El desarrollo se llevó a cabo bajo el marco ágil **Scrum / Kanban**, organizado en las siguientes fases del proyecto Capstone:

- **FASE 1:** Definición del proyecto, toma de requerimientos y arquitectura.
- **FASE 2:** Desarrollo de la API REST, interfaz web, base de datos y pruebas de integración.
- **FASE 3:** Documentación final, manuales y preparación de la defensa ante comisión.

---

## 🤝 Equipo y Contrapartes

**Equipo de desarrollo**

- Jean García — Líder de Proyecto / Desarrollador Principal

**Contraparte cliente**

- Paz Constanza Morales Saavedra — Representante del CITT (pc.morales@profesor.duoc.cl)

**Docente guía**

- Fabián Alcántara Guajardo (f.alcantara@profesor.duoc.cl)

---

*Proyecto Capstone 2026-2 – Incubadora · Duoc UC Sede San Bernardo*
