# Configuración de Supabase para el Frontend

## Variables de Entorno Necesarias

Necesitás agregar estas variables de entorno en **Vercel** (o en tu archivo `.env` local):

```
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

## Cómo obtener las credenciales de Supabase

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Ve a **Settings** → **API**
3. Copia:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`

## Configurar en Vercel

1. Ve a tu proyecto en Vercel
2. Ve a **Settings** → **Environment Variables**
3. Agrega las dos variables de entorno
4. Haz un nuevo deploy

## Estado de la Migración

✅ **Completado:**
- Login (con autenticación básica usando tabla `admins`)
- ReservasSection
- SociosSection

⏳ **Pendiente:**
- ActividadesSection
- EstablecimientosSection
- MantenimientoSection
- VentasSection
- StockSection
- ComprasSection
- InscripcionesSection
- DocumentosSection (requiere Supabase Storage)
- Otras secciones menores (Inicio, Horarios, Buffet, etc.)

## Notas Importantes

- **Autenticación**: El login ahora consulta directamente la tabla `admins` en Supabase. Asegurate de que la tabla tenga usuarios con passwords hasheados con bcrypt.
- **Sin validaciones del backend**: Como solicitaste, no hay validaciones de negocio (ej: superposición de reservas). El frontend hace las operaciones directamente en Supabase.
- **Documentos**: La sección de documentos requiere configurar Supabase Storage. Por ahora está pendiente.

