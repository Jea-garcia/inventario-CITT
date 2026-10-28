# CITT Stock 📦

Plataforma web de gestión, control de inventario y trazabilidad de activos para el Centro de Innovación y Transferencia Tecnológica (CITT) – Duoc UC Sede San Bernardo.

---

## 📌 Descripción General
**CITT Stock** es una solución tecnológica integral desarrollada para optimizar la administración de activos, herramientas e insumos consumibles en el CITT de Duoc UC Sede San Bernardo. El sistema centraliza el control de inventario y automatiza los flujos de préstamos temporales, devoluciones y entregas definitivas, integrando lectura y generación de códigos QR para una trazabilidad precisa en tiempo real.

---

## ✨ Características Principales
- 🔄 **Control de Movimientos Diferenciado:** Gestión de tres flujos clave:
  - **Préstamos:** Registro obligatorio de fecha límite de retorno.
  - **Devoluciones:** Cierre de ciclo de préstamos con reintegración a casillero.
  - **Pedidos / Entregas Definitivas:** Para insumos consumibles (sin fecha de retorno).
- 🖨️ **Gestión de Consumibles (Filamento 3D):** Conversión matemática automatizada entre unidades (ingreso de stock en kilogramos y consumo/descuento en gramos).
- 📍 **Organización por Casilleros:** Mapeo de disponibilidad de inventario en tiempo real (*Ocupado* / *Disponible*), con soporte para activos categorizados como *"Sin Casillero"*.
- 🏷️ **Identificación vía Códigos QR:** Generación automática de códigos únicos según su categoría (`IM-CITT-`, `3D-CITT-`, `TA-CITT-`, `EQ-CITT-`) y escaneo ágil en ventanilla.
- 🛠️ **Módulo de Mantenimiento:** Seguimiento de Órdenes de Trabajo (OT) preventivas y correctivas bajo los estados: *En proceso*, *En diagnóstico* y *Finalizada*.
- 📊 **Analítica y Alertas Operativas:** Dashboard interactivo, alertas de stock crítico, préstamos vencidos y exportación de reportes.

---

## 👥 Roles y Permisos del Sistema
El sistema opera bajo un modelo de accesos jerárquicos:
- **Administrador:** Control total del sistema, parametrización, reportes y aprobaciones generales.
- **Alumno Líder (AL):** Gestión operativa presencial en ventanilla para registrar préstamos, devoluciones y entregas definitivas.
- **Usuario Global (Comunidad Duoc UC):** Estudiantes y docentes. Consultan el catálogo y realizan solicitudes presenciales sujeto a aprobación de un Administrador o Alumno Líder.

---

## 🛠️ Tecnologías Utilizadas
El proyecto está construido bajo una arquitectura moderna, escalable y con soporte **Multi-Tenancy** (*Shared Database, Shared Schema* con *Row Level Security* / RLS):

- **Frontend:** Next.js (React), TypeScript, Tailwind CSS, Shadcn UI, Lucide React.
- **Backend:** NestJS (Node.js), TypeScript, TypeORM, Swagger API Docs.
- **Base de Datos:** PostgreSQL con Row Level Security (RLS) e identificadores UUID v4.
- **Infraestructura y Despliegue:** Docker, Docker Compose.

---

## 🏗️ Arquitectura de la Solución


┌─────────────────────────────────────────────────────────┐
│                    CLIENTE / FRONTEND                   │
│           Next.js + TypeScript + Tailwind CSS           │
└────────────────────────────┬────────────────────────────┘
│ REST API (JWT)
▼
┌─────────────────────────────────────────────────────────┐
│                    SERVIDOR / BACKEND                   │
│               NestJS + TypeScript + TypeORM             │
└────────────────────────────┬────────────────────────────┘
│ SQL / RLS (app.tenant_id)
▼
┌─────────────────────────────────────────────────────────┐
│                  BASE DE DATOS / DATABASE               │
│          PostgreSQL Multi-Tenant (Shared Schema)        │
└─────────────────────────────────────────────────────────┘

---

## 🚀 Guía de Instalación y Ejecución Local

### Prerrequisitos
- Node.js (v18+)
- PostgreSQL (v14+) o Docker Desktop

### 1. Clonar el repositorio
```bash
git clone [https://github.com/Jea-garcia/inventario-CITT.git](https://github.com/Jea-garcia/inventario-CITT.git)
cd inventario-CITT

2. Configurar Base de Datos
Crear una base de datos vacía en PostgreSQL llamada citt_stock_db.

Ejecutar los scripts SQL ubicados en FASE 2/database/migrations/ en el orden indicado:

001_add_inventory_fields.sql

002_enable_tenant_rls.sql

003_add_loan_quantity.sql

004_complete_inventory_schema.sql

005_authentication.sql (Definiendo SET app.tenant_id = 'UUID_DE_LA_SEDE';)

3. Backend (NestJS)

# Navegar a la carpeta backend e instalar dependencias
npm install

# Iniciar en modo desarrollo
npm run start:dev

API disponible en: http://localhost:3001Documentación Swagger: http://localhost:3001/api4. Frontend (Next.js)Bash# Navegar a la carpeta frontend e instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
Aplicación disponible en: http://localhost:3000📋 Metodología de TrabajoEl desarrollo se llevó a cabo bajo el marco ágil Scrum / Kanban, organizado en las siguientes fases del proyecto Capstone:FASE 1: Definición del proyecto, toma de requerimientos y arquitectura.   FASE 2: Desarrollo de la API REST, interfaz web, base de datos y pruebas de integración.   FASE 3: Documentación final, manuales y preparación de la defensa ante comisión.   👥 Equipo de Desarrollo y RepresentantesContraparte Institucional / ClientePaz Constanza Morales Saavedra (pc.morales@profesor.duoc.cl) — Representante del CITT.   Docente GuíaFabián Alcántara Guajardo (f.alcantara@profesor.duoc.cl)   Unidad Ejecutora (Escuela de Informática y Telecomunicaciones)Jean García — Líder de Proyecto / Desarrollador Principal
