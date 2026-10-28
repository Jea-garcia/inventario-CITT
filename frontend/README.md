Markdown# CITT Stock - Frontend Web 🎨

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

---

### Pasos finales para actualizar en tu terminal:

1. Reemplaza el contenido de `frontend/README.md` con este bloque.
2. Ejecuta los comandos en la raíz del proyecto para sincronizar GitHub:

```powershell
git add frontend/README.md
git commit -m "docs: actualizado README.md del frontend"
git push origin main
