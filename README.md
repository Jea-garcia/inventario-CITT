📦 Inventario Digital — Almendro Inversiones Ltda.

Proyecto Capstone 2026-2 — Incubadora

Sistema web para la gestión y control del inventario del Hotel Almendro Inversiones Ltda.

👥 Integrantes

- ARIANETTE PAVEZ — Líder
- TANIA GAETE — Integrante
- JEAN GARCIA — Integrante

🏨 Descripción del Proyecto

Inventario Digital es una solución web orientada a digitalizar y mejorar la gestión del inventario del Hotel Almendro Inversiones Ltda.

El sistema permitirá centralizar la información de productos e insumos, registrar entradas y salidas, consultar el stock disponible y mantener un historial de los movimientos realizados.

La solución busca reducir errores asociados al registro manual, mejorar la trazabilidad y facilitar el acceso a información actualizada para la gestión del inventario.

🎯 Objetivo General

Desarrollar un sistema digital que permita gestionar de manera centralizada el inventario del Hotel Almendro Inversiones Ltda., facilitando el control de productos, existencias y movimientos.

🎯 Objetivos Específicos

- Digitalizar el registro de productos e insumos.
- Mantener actualizado el stock disponible.
- Registrar entradas y salidas de inventario.
- Consultar el historial de movimientos.
- Identificar productos con stock bajo.
- Facilitar la consulta de información del inventario.
- Controlar el acceso de los usuarios según sus permisos.
- Mejorar la trazabilidad de las operaciones.

📦 Funcionalidades Principales

Gestión de inventario

- Registro de productos e insumos.
- Consulta de productos.
- Control de stock.
- Control de stock mínimo.
- Identificación de productos con bajo stock.

Entradas y salidas

- Registro de entradas de productos.
- Registro de salidas de productos.
- Fecha y cantidad de la operación.
- Usuario responsable.
- Observaciones.

Movimientos

- Historial de movimientos.
- Diferenciación entre entradas y salidas.
- Consulta por producto y fecha.
- Registro del usuario responsable.

Usuarios

- Inicio de sesión.
- Gestión de usuarios.
- Roles y permisos de acceso.

Dashboard y reportes

- Resumen del inventario.
- Productos con stock bajo.
- Productos sin stock.
- Resumen de movimientos.

👤 Usuarios del Sistema

El sistema contempla inicialmente los siguientes perfiles:

Perfil| Descripción
Administrador| Gestiona usuarios, productos e inventario.
Recepcionista| Consulta información y registra operaciones autorizadas.
Mantención| Consulta y registra operaciones relacionadas con sus funciones.

Los permisos definitivos serán establecidos durante el levantamiento y validación de requerimientos.

🏗️ Arquitectura

El proyecto contempla inicialmente una arquitectura basada en microservicios, buscando separar las principales funcionalidades del sistema en servicios independientes.

Microservicios propuestos

                 ┌─────────────────┐
                 │    FRONTEND     │
                 │ Inventario Web  │
                 └────────┬────────┘
                          │
                          ▼
                 ┌─────────────────┐
                 │   API GATEWAY   │
                 └────────┬────────┘
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
   ┌────────────┐  ┌────────────┐  ┌────────────┐
   │    AUTH    │  │ INVENTARIO │  │ MOVIMIENTOS│
   │  SERVICE   │  │  SERVICE   │  │  SERVICE   │
   └────────────┘  └────────────┘  └────────────┘
                          │
                          ▼
                   ┌────────────┐
                   │  REPORTES  │
                   │  SERVICE   │
                   └────────────┘

La distribución definitiva de los servicios podrá ajustarse durante el desarrollo según los requerimientos técnicos y las decisiones de arquitectura del proyecto.

🚀 Metodología

El proyecto será desarrollado utilizando una metodología Ágil — Scrum.

El trabajo se organizará mediante Sprints, permitiendo realizar planificación, desarrollo, pruebas, revisión y mejora continua.

Acta de Kick-Off

- Proyecto: Inventario Digital
- Empresa: Almendro Inversiones Ltda.
- Fecha: 25 de agosto de 2026
- Metodología: Scrum
- Duración estimada de Sprint: 2 semanas
- Objetivo inicial: Digitalizar el control del inventario y reducir errores asociados a procesos manuales.

🖥️ Prototipo

El diseño inicial de la solución será desarrollado mediante mockups, los cuales serán validados con la contraparte durante el desarrollo del proyecto.

Las principales pantallas contempladas inicialmente son:

- Login.
- Dashboard.
- Inventario.
- Productos.
- Entradas.
- Salidas.
- Movimientos.
- Usuarios.
- Reportes.

🛠️ Tecnologías

Las tecnologías definitivas serán establecidas durante la etapa de diseño técnico.

Inicialmente se contempla:

- Frontend web.
- Backend basado en microservicios.
- APIs para comunicación entre componentes.
- Base de datos.
- Git y GitHub.
- Docker para el despliegue de los servicios.

📂 Estructura del Repositorio

inventario-digital/
│
├── docs/
│   ├── requerimientos/
│   ├── arquitectura/
│   ├── diagramas/
│   ├── mockups/
│   └── metodologia/
│
├── frontend/
│
├── services/
│   ├── auth-service/
│   ├── inventory-service/
│   ├── movement-service/
│   └── report-service/
│
├── docker-compose.yml
│
└── README.md

📌 Estado del Proyecto

Estado: 🟡 En desarrollo

- [x] Definición inicial del proyecto
- [x] Definición del equipo
- [x] Acta de Kick-Off
- [x] Definición de metodología
- [ ] Levantamiento y validación de requerimientos
- [ ] Diseño del prototipo
- [ ] Diseño de arquitectura
- [ ] Diseño de base de datos
- [ ] Desarrollo de microservicios
- [ ] Desarrollo del frontend
- [ ] Integración de componentes
- [ ] Pruebas
- [ ] Documentación final
- [ ] Presentación Capstone

📄 Documentación

La documentación complementaria del proyecto se encuentra en la carpeta "/docs".

En ella se incorporarán los documentos correspondientes a:

- Requerimientos.
- Arquitectura.
- Diagramas UML.
- Mockups.
- Metodología.
- Pruebas.
- Evidencias.
- Documentación final.

---

Capstone 2026-2 — Incubadora

Inventario Digital — Almendro Inversiones Ltda.

ARIANETTE PAVEZ · TANIA GAETE · JEAN GARCIA
