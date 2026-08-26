# Inventario Digital - Almendro Inversiones Ltda.

**Proyecto Capstone 2026-2 - Incubadora**

Aplicación móvil de uso interno para la gestión, control y trazabilidad en tiempo real del inventario de insumos. El sistema centraliza la información de productos e insumos, permitiendo registrar ingresos, salidas y mermas, consultar el stock disponible y mantener la trazabilidad operativa.

---

## Integrantes del Equipo

- **Arianette Pavez** - Líder
- **Tania Gaete** - Integrante
- **Jean Garcia** - Integrante

---

## Objetivos del Proyecto

### Objetivo General
Desarrollar una aplicación móvil interna y un sistema digital que permita gestionar de manera centralizada el inventario de insumos, facilitando el control de existencias, vencimientos y movimientos.

### Objetivos Específicos
- Digitalizar la gestión y el registro de productos e insumos de cocina.
- Mantener actualizado el stock disponible en tiempo real.
- Registrar operaciones directas de inventario: ingresos (agregar), salidas (sacar) y mermas (merma).
- Gestionar alertas tempranas de vencimiento mediante un sistema de semaforización.
- Registrar e identificar productos sin código de barras.
- Vincular la ubicación física en bodega y estantes con la base de datos.
- Consultar el historial de movimientos y reportes de inventario.

---

## Funcionalidades Principales

### Gestión de Inventario y Operaciones de Bodega
- Registro, consulta y control de productos e insumos de alimentación.
- Control de existencias, stock mínimo e identificación de productos con bajo stock.
- **Registro de ingresos (agregar):** incorporación directa de insumos a la bodega.
- **Registro de salidas (sacar):** retiro de insumos para preparación de alimentos y recetas.
- **Registro y clasificación de mermas (merma):** control de pérdidas por vencimiento, daño o deterioro.
- Registro de fecha, cantidad y observaciones de cada movimiento.
- Identificación y mapeo de productos sin código de barras.
- Control de ubicación física en estantes de bodega y cocina.

### Sistema de Semaforización y Alertas
- 🟢 **Verde:** Insumo fresco o con fecha de vencimiento lejana.
- 🟡 **Amarillo:** Insumo en ventana de atención (priorizar uso en cocina).
- 🔴 **Rojo:** Insumo crítico o vencido (retirar de bodega y registrar merma).

### Historial y Reportes
- Historial unificado de movimientos (ingresos, salidas y mermas).
- Dashboard con resúmenes de inventario, stock crítico y métricas de consumo.

---

## Arquitectura del Sistema (Monorepo)

El proyecto está estructurado bajo un esquema de monorepo utilizando arquitectura de microservicios en el backend para permitir la modificabilidad y escalabilidad futura de cada módulo sin afectar la totalidad de la aplicación.

```text
     ┌────────────────────────┐
     │    Aplicación Móvil    │
     │   (iOS / Android UI)   │
     └───────────┬────────────┘
                 │ API Rest / Gateway
     ┌───────────┼───────────┬───────────┬───────────┐
     ▼           ▼           ▼           ▼           ▼
┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
│inventory│ │movement │ │ waste   │ │ alert   │ │ barcode │
│service  │ │service  │ │ service │ │service  │ │service  │
└────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘
     │           │           │           │           │
     └───────────┴─────┬─────┴───────────┴───────────┘
                       ▼
            ┌────────────────────┐
            │   Base de Datos    │
            └────────────────────┘
```

---

## Estructura del Repositorio

```text
inventario-digital/
│
├── docs/                     # Documentación de requerimientos, arquitectura, diagramas y mockups
│   ├── requerimientos/
│   ├── arquitectura/
│   ├── diagramas/
│   ├── mockups/
│   └── metodologia/
│
├── mobile-app/               # Código fuente de la aplicación móvil de uso interno
│
├── microservices/            # Servicios del backend en microservicios
│   ├── purchase-service/     # Gestión y registro de compras (Recepcionista)
│   ├── inventory-service/    # Consulta de existencias y catálogo de productos
│   ├── movement-service/     # Gestión de entradas (agregar) y salidas (sacar)
│   ├── waste-service/        # Gestión y clasificación de mermas (merma)
│   ├── alert-service/        # Semaforización y avisos de vencimiento
│   └── barcode-service/      # Registro e identificación de productos sin código
│
├── database/                 # Esquemas, scripts y migraciones de la base de datos
├── docker-compose.yml        # Orquestación de servicios locales
└── README.md                 # Documentación principal del proyecto
```

---

## Metodología y Acta de Kick-Off

El proyecto se desarrolla bajo la metodología **Ágil - Scrum** organizada en Sprints de 2 semanas.

- **Proyecto:** Inventario Digital
- **Empresa:** Almendro Inversiones Ltda
- **Fecha de Inicio:** 25 de agosto de 2026
- **Metodología:** Scrum
- **Duración de Sprint:** 2 semanas
- **Objetivo Inicial:** Digitalizar el control del inventario y reducir errores asociados a procesos manuales.

---

## Tecnologías

- **Aplicación Móvil:** Desarrollo móvil multiplataforma para uso interno privado.
- **Backend:** Microservicios con API Gateway y APIs REST.
- **Base de Datos:** Relacional / NoSQL según la necesidad del servicio.
- **Despliegue y Control:** Docker, Docker Compose, Git y GitHub.

---

## Estado del Proyecto

- [ ] Definición inicial del proyecto
- [ ] Definición del equipo
- [ ] Acta de Kick-Off
- [ ] Definición de metodología
- [ ] Levantamiento y validación de requerimientos
- [ ] Diseño del prototipo
- [ ] Diseño de arquitectura
- [ ] Diseño de base de datos
- [ ] Desarrollo de microservicios
- [ ] Desarrollo de la aplicación móvil
- [ ] Integración de componentes
- [ ] Pruebas
- [ ] Documentación final
- [ ] Presentación Capstone

---

## Instalación y Configuración Local

```bash
# 1. Clonar el repositorio
git clone [https://github.com/Jea-garcia/inventario-digital.git](https://github.com/Jea-garcia/inventario-digital.git)

# 2. Acceder al directorio
cd inventario-digital

# 3. Configurar variables de entorno
cp .env.example .env

# 4. Levantar servicios locales con Docker
docker compose up -d
```

---

## Documentación Adicional

La documentación complementaria técnica y operativa se encuentra en la carpeta `/docs`:

- Requerimientos técnicos y funcionales
- Arquitectura del sistema y flujo de datos
- Diagramas UML y modelos de base de datos
- Mockups y prototipos de la interfaz móvil
- Sistema de Semaforización y Alertas Tempranas
