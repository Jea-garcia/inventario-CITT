# CITT Stock – Backend ⚙️

API REST de **CITT Stock**, el sistema de inventario y trazabilidad de activos del Centro de Innovación y Transferencia Tecnológica (CITT) – Duoc UC Sede San Bernardo.

Esta carpeta contiene el servidor. La interfaz web está en [`../frontend`](../frontend/README.md) y los scripts de base de datos en [`../FASE 2/database/migrations`](../FASE%202/database/migrations).

---

## 🛠️ Tecnologías

- **NestJS** (Node.js) con **TypeScript**
- **TypeORM** como capa de acceso a datos
- **PostgreSQL** con **Row Level Security (RLS)** e identificadores UUID v4
- **Swagger** para la documentación interactiva de la API
- **JWT** para la autenticación

---

## 🏗️ Arquitectura Multi-Tenant

El sistema usa el modelo **Shared Database, Shared Schema**: todas las sedes comparten las mismas tablas y el aislamiento de datos lo garantiza PostgreSQL mediante Row Level Security.

```text
Petición HTTP  ──►  NestJS  ──►  SET app.tenant_id = '<UUID_DE_LA_SEDE>'  ──►  PostgreSQL (RLS)
```

Cada consulta solo ve las filas cuyo `tenant_id` coincide con el valor de `app.tenant_id` de la sesión.

---

## 🚀 Instalación y Ejecución

### Prerrequisitos

- Node.js v18 o superior
- PostgreSQL v14 o superior (o Docker Desktop)

### 1. Preparar la base de datos

1. Crear una base de datos vacía llamada `citt_stock_db`.
2. Ejecutar, en este orden, los scripts de `FASE 2/database/migrations/`:

   1. `001_add_inventory_fields.sql`
   2. `002_enable_tenant_rls.sql`
   3. `003_add_loan_quantity.sql`
   4. `004_complete_inventory_schema.sql`
   5. `005_authentication.sql`

3. Definir el identificador de la sede:

   ```sql
   SET app.tenant_id = 'UUID_DE_LA_SEDE';
   ```

### 2. Configurar la conexión

En el archivo de entorno del backend (`.env`), configura los datos de conexión a PostgreSQL: host, puerto, usuario, contraseña y nombre de la base (`citt_stock_db`).

### 3. Instalar y ejecutar

```bash
# Desde la raíz del repositorio
cd backend

# Instalar dependencias
npm install

# Iniciar en modo desarrollo (recarga automática)
npm run start:dev
```

> **Importante:** ejecuta `npm install` dentro de la carpeta `backend`, no en la raíz del repositorio.

| Recurso | URL |
| --- | --- |
| API | <http://localhost:3001> |
| Documentación Swagger | <http://localhost:3001/api> |

Para producción:

```bash
npm run build
npm run start:prod
```

---

## 📖 Documentación de la API

Todos los endpoints, sus parámetros y sus respuestas están documentados y se pueden probar desde Swagger en <http://localhost:3001/api>.

---

## 🗃️ Modelo de Datos (resumen)

Los scripts de migración construyen el esquema de forma incremental:

| Script | Contenido |
| --- | --- |
| `001_add_inventory_fields.sql` | Campos base del inventario. |
| `002_enable_tenant_rls.sql` | Multi-tenancy con Row Level Security. |
| `003_add_loan_quantity.sql` | Cantidad en los préstamos. |
| `004_complete_inventory_schema.sql` | Esquema completo de inventario. |
| `005_authentication.sql` | Usuarios y autenticación. |

---

## 📏 Reglas de Negocio del Dominio

Definidas en el Informe de Toma de Requerimientos con la contraparte del CITT:

- **Roles:** Administrador (control total), Alumno Líder (préstamos, devoluciones, pedidos y aprobación de solicitudes presenciales) y Usuario Global (~300 usuarios, solicita de forma presencial).
- **Movimientos:** el *préstamo* y la *devolución* exigen fecha de retorno y escuela asociada. El *pedido* (entrega definitiva, para consumibles) no lleva fecha de retorno.
- **Escuelas:** Construcción, Mecánica, Administración, Informática, Salud, Turismo y Naturaleza.
- **Codificación de activos:** `IM-CITT-` (Mobiliario), `3D-CITT-` (3D), `TA-CITT-` (Talleres) y `EQ-CITT-` (Equipamiento), seguidos de un correlativo.
- **Consumibles:** el stock se ingresa en kilogramos y se descuenta en gramos (10 kg − 50 g = 9,95 kg).
- **Stock mínimo:** 1, sin tope máximo.
- **Mantenimiento (OT):** tipos *Preventivo* y *Correctivo*; estados *En proceso*, *En diagnóstico* y *Finalizada*.
- **Bajas:** el activo no se elimina; pasa a estado de baja con confirmación y queda en el historial.

---

## 🤝 Equipo y Contrapartes

- Jean García — Líder de Proyecto / Desarrollador Principal
- Contraparte cliente: Paz Constanza Morales Saavedra (pc.morales@profesor.duoc.cl)
- Docente guía: Fabián Alcántara Guajardo (f.alcantara@profesor.duoc.cl)

*Proyecto Capstone 2026-2 – Incubadora · Duoc UC Sede San Bernardo*
