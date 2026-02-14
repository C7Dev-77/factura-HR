# 📋 Factura LVL - Sistema de Facturación Electrónica

Sistema de facturación electrónica moderno y profesional para **M&D Hijos del Rey**, empresa especializada en muebles.

---

## ✨ Mejoras Implementadas

### 🎨 **1. Login Mejorado**
- ✅ **Animaciones de facturas flotantes** en el panel izquierdo
- ✅ **Números y símbolos animados** ($, COP, FE-001, etc.)
- ✅ **Contador de estadísticas en tiempo real** (facturas e ingresos)
- ✅ **Animación de pulso** en el logo de la empresa
- ✅ **Corregidos errores de ortografía** en placeholders

### 🗄️ **2. Configuración de Supabase**
- ✅ Cliente de Supabase instalado (`@supabase/supabase-js`)
- ✅ Archivo de configuración creado (`src/lib/supabase.ts`)
- ✅ Variables de entorno preparadas (`.env`)
- ✅ Script SQL completo para crear todas las tablas (`supabase-setup.sql`)
- ✅ Guía detallada paso a paso (`GUIA-SUPABASE.md`)

---

## 📦 Estructura de la Base de Datos

### Tablas Creadas:
1. **`profiles`** - Perfil de la empresa/usuario
2. **`clients`** - Clientes de la empresa
3. **`products`** - Catálogo de muebles y servicios
4. **`invoices`** - Encabezados de facturas
5. **`invoice_items`** - Detalles/ítems de cada factura

### Características de Seguridad:
- ✅ Row Level Security (RLS) habilitado
- ✅ Políticas de acceso para usuarios autenticados
- ✅ Triggers automáticos para `updated_at`
- ✅ Índices optimizados para búsquedas rápidas

---

## 🚀 Cómo Empezar

### 1. Instalar Dependencias
```bash
npm install
```

### 2. Configurar Supabase
Sigue la guía completa en: **[GUIA-SUPABASE.md](./GUIA-SUPABASE.md)**

Resumen rápido:
1. Crea una cuenta en [Supabase](https://supabase.com)
2. Crea un nuevo proyecto
3. Ejecuta el script `supabase-setup.sql` en el SQL Editor
4. Copia tus credenciales al archivo `.env`:
   ```env
   VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui
   ```

### 3. Iniciar el Proyecto
```bash
npm run dev
```

Abre [http://localhost:8080](http://localhost:8080) en tu navegador.

---

## 📂 Estructura del Proyecto

```
Factura LVL/
├── src/
│   ├── components/       # Componentes reutilizables
│   │   ├── dialogs/      # Diálogos (Nueva factura, cliente, etc.)
│   │   ├── login/        # Panel izquierdo del login
│   │   └── ui/           # Componentes de Shadcn UI
│   ├── lib/              # Utilidades y configuración
│   │   └── supabase.ts   # 🆕 Cliente de Supabase
│   ├── pages/            # Páginas principales
│   │   ├── LoginPage.tsx      # 🎨 Mejorado con animaciones
│   │   ├── DashboardPage.tsx
│   │   ├── InvoicesPage.tsx
│   │   ├── ClientsPage.tsx
│   │   ├── ProductsPage.tsx
│   │   └── ReportsPage.tsx
│   └── App.tsx           # Router principal
├── .env                  # 🆕 Variables de entorno (credenciales)
├── supabase-setup.sql    # 🆕 Script de creación de DB
└── GUIA-SUPABASE.md      # 🆕 Guía de configuración
```

---

## 🎯 Próximos Pasos (Roadmap)

### Fase 1: Autenticación Real ✅ (En Proceso)
- [x] Configurar Supabase
- [x] Crear tablas en la base de datos
- [ ] Conectar login con Supabase Auth
- [ ] Implementar registro de usuarios
- [ ] Proteger rutas privadas

### Fase 2: CRUD de Clientes
- [ ] Crear cliente con guardado real
- [ ] Editar cliente existente
- [ ] Eliminar/Desactivar cliente
- [ ] Búsqueda y filtrado en tiempo real

### Fase 3: CRUD de Productos (Muebles)
- [ ] Cambiar categorías a: Salas, Comedores, Alcobas, Oficina, Decoración
- [ ] Crear producto con guardado real
- [ ] Editar producto existente
- [ ] Eliminar/Desactivar producto
- [ ] Control de inventario

### Fase 4: Facturación
- [ ] Guardar facturas en Supabase
- [ ] Cambio de estado (Pendiente → Pagada/Vencida/Anulada)
- [ ] Cálculo automático de vencimiento
- [ ] Asociar productos a facturas

### Fase 5: Reportes y Análisis
- [ ] Conectar gráficas a datos reales
- [ ] Filtro de fechas funcional
- [ ] Exportación de reportes a PDF

### Fase 6: Exportación
- [ ] Estandarizar a PDF (actualmente algunos usan CSV)
- [ ] Diseño profesional de PDFs con logo
- [ ] Envío automático por WhatsApp/Email

---

## 🛠️ Tecnologías Utilizadas

- **React 18** + **TypeScript**
- **Vite** (Build tool ultra-rápido)
- **Tailwind CSS** (Diseño responsivo)
- **Shadcn UI** (Componentes premium)
- **Supabase** (Base de datos + Autenticación)
- **React Router** (Navegación)
- **Lucide Icons** (Iconos modernos)

---

## 📝 Notas Importantes

⚠️ **Archivos Sensibles**:
- El archivo `.env` NO debe subirse a GitHub (ya está en `.gitignore`)
- Nunca compartas tu `VITE_SUPABASE_ANON_KEY` públicamente (aunque sea la pública)

🎨 **Diseño**:
- Paleta de colores tierra (Browns, Beige, Gold) para elegancia
- Diseño adaptado a mueblería de lujo
- Totalmente responsivo (móvil, tablet, desktop)

---

## 🐛 Solución de Problemas

### El servidor no inicia
```bash
# Elimina node_modules y reinstala
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Las animaciones no se ven
- Verifica que el servidor esté corriendo en `http://localhost:8080`
- Limpia la caché del navegador (Ctrl + Shift + R)

### Supabase no conecta
- Revisa el archivo GUIA-SUPABASE.md
- Verifica las credenciales en `.env`
- Reinicia el servidor después de cambiar `.env`

---

## 📞 Contacto

Para soporte o preguntas sobre el sistema, contacta al desarrollador.

---

**M&D Hijos del Rey** - Sistema de Facturación Electrónica v1.0
