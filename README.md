# 🪑 M&D Hijos del Rey — Sistema de Facturación Electrónica

> Plataforma web de facturación electrónica moderna, con Asistente de IA integrado, diseñada para mueblería M&D Hijos del Rey. Accesible desde cualquier dispositivo, sin instalaciones.

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?logo=supabase&logoColor=white)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?logo=tailwindcss&logoColor=white)

---

## 🧾 ¿Qué es este sistema?

Es una **aplicación web de facturación electrónica** pensada para negocios de muebles, aunque puede adaptarse a cualquier empresa. Permite crear, gestionar y exportar facturas de forma rápida y sencilla, ya sea desde un computador o un celular.

### ¿Qué puedes hacer con esta aplicación?

- 🧾 **Crear facturas** en segundos — elige el cliente, los productos y el sistema calcula totales e IVA automáticamente
- 🤖 **Asistente de IA** — dile en español: *"hazle una factura a Juan por 2 sillas a $150.000"* y la crea sola
- 📱 **Funciona en celular** — diseño 100% responsive, adaptado a pantallas móviles
- 📥 **Exportar PDF** — con logo de empresa, datos del cliente y detalle de productos
- 👥 **Gestionar clientes** — NIT, teléfono, dirección, todo en un solo lugar
- 📦 **Catálogo de productos** — precios, impuestos y categorías organizadas
- 📊 **Reportes y estadísticas** — ingresos mensuales, mejores clientes, cartera pendiente
- ☁️ **Acceso desde cualquier lugar** — está en la nube, no necesita instalación

---

## 🖼️ Módulos del Sistema

| Módulo | Descripción |
|---|---|
| **Dashboard** | KPIs en tiempo real: ingresos, facturas emitidas, clientes y productos |
| **Facturas** | Crear, editar, cambiar estado (pagada/pendiente/vencida/anulada), exportar PDF y CSV |
| **Asistente IA** | Crear facturas por chat en lenguaje natural usando Llama 3.3 vía Groq |
| **Clientes** | CRUD completo con búsqueda, filtros y exportación CSV |
| **Productos** | CRUD con categorías, precios, impuestos y stock |
| **Reportes** | Gráficas de ingresos mensuales, distribución de estados, top clientes |
| **Configuración** | Datos de empresa, resolución DIAN, logo, numeración y preferencias |

---

## 🛠️ Stack Técnico (Para Ingenieros)

### Frontend
- **React 18** + **TypeScript** — tipado estricto en toda la aplicación
- **Vite** — bundler ultrarrápido con HMR
- **Tailwind CSS** — estilos utilitarios con sistema de diseño personalizado (Earth Tones)
- **shadcn/ui** — componentes accesibles basados en Radix UI
- **React Router DOM** — navegación SPA con rutas protegidas
- **Recharts** — gráficas interactivas para reportes
- **jsPDF + html2canvas** — generación de PDF en el cliente
- **Lucide React** — íconos SVG optimizados

### Backend / Infraestructura
- **Supabase** — PostgreSQL + Auth (JWT) + Storage (logos)
- **Groq API** (Llama 3.3-70B) — modelo de lenguaje para el asistente de facturación
- **Vercel** — deploy automático desde GitHub con CI/CD

### Arquitectura
```
src/
├── components/
│   ├── dialogs/          # Diálogos: Crear/Editar Factura, Producto, Cliente, AI
│   ├── dashboard/        # KPICard, RecentSalesTable
│   └── ui/               # Componentes shadcn/ui
├── contexts/             # AuthContext (Supabase session)
├── hooks/                # useInvoices, useClients, useProducts, useSettings, ...
├── lib/                  # supabase.ts, gemini.ts, export-utils.ts
├── pages/                # Dashboard, Facturas, Clientes, Productos, Reportes, Config
└── index.css             # Design tokens + utilidades globales
```

### Decisiones de diseño clave
- **Mobile-first:** Diálogos como *bottom sheet* en móvil, navegación adaptativa, grids responsivos
- **Hooks personalizados:** Toda la lógica de datos (CRUD, loading, error) encapsulada en hooks reutilizables
- **Rutas protegidas:** `<ProtectedRoute>` verifica sesión activa antes de renderizar cualquier página privada
- **Design system:** Variables CSS con paleta *Earth Tones* (warmth + profesionalismo), modo claro/oscuro listo

---

## 🚀 Instalación y Ejecución Local

### Prerrequisitos
- Node.js 18+
- npm o yarn
- Cuenta en [Supabase](https://supabase.com)
- API Key de [Groq](https://console.groq.com) (para el asistente IA)

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/C7Dev-77/factura-HR.git
cd factura-HR

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de Supabase y Groq

# 4. Ejecutar en desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:8080`

### Variables de entorno requeridas

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
VITE_GROQ_API_KEY=tu-groq-api-key   # Opcional, para el asistente IA
```

---

## 🗄️ Base de Datos (Supabase)

Tablas principales:
- `profiles` — Datos de empresa y configuración por usuario
- `clients` — Clientes registrados
- `products` — Catálogo de productos/servicios
- `invoices` — Facturas emitidas
- `invoice_items` — Ítems de cada factura

Row Level Security (RLS) habilitado: cada usuario solo ve y modifica sus propios datos.

---

## 📦 Scripts disponibles

```bash
npm run dev       # Inicia el servidor de desarrollo
npm run build     # Genera el build de producción en /dist
npm run preview   # Previsualiza el build de producción
npm run lint      # Ejecuta ESLint
npm test          # Ejecuta tests con Vitest
```

---

## 🌐 Deploy

El proyecto está configurado para deploy automático en **Vercel**:
- Cada `push` a `main` dispara un nuevo deploy
- El archivo `vercel.json` incluye la configuración de rewrites para SPA

---

## 👨‍💻 Desarrollado por

**C7Dev-77** — Para M&D Hijos del Rey  
Sistema de Facturación Electrónica — 2026

---

> 💡 **Nota para clientes:** No necesitas saber nada de programación para usar esta herramienta. Solo necesitas un navegador web (Chrome, Firefox, Safari) y tu usuario. El equipo técnico se encarga del resto.
