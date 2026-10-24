# Mapa de Entregas – Gran Buenos Aires

PoC de datos georreferenciados · ISFT – Logística
**Dataset → Supabase → React/Vite → deck.gl → Vercel**

**URL pública:** https://poc-logistica-zbx5.vercel.app

## Descripción del proyecto
1. **Problema analizado:** en qué zonas de CABA y del Gran Buenos Aires hay mayores demoras en la entrega de pedidos.
2. **Datos:** 40 pedidos simulados (estado, tiempo de entrega y fecha) sobre direcciones reales de Buenos Aires; no provienen de un dataset externo. Se cargaron en una tabla de Supabase.
3. **Qué representa el mapa:** cada pedido es un punto; el color indica el estado (Entregado, En camino, Pendiente) y el tamaño, el tiempo de entrega en minutos.
4. **Qué permite observar:** las entregas más demoradas (más de 100 min) se concentran en el Gran Buenos Aires; el tablero muestra total de pedidos, tiempo promedio y entregas críticas, con filtro por estado y mapa de calor.
5. **Segunda versión:** datos reales de entregas, filtros por fecha y zona, y rutas de reparto.

## Tecnologías
Supabase (base de datos) · React + Vite · deck.gl (ScatterplotLayer y HeatmapLayer) · MapLibre (mapa base) · Vercel

## Tabla `puntos` (Supabase)
`id, nombre, direccion, zona, latitud, longitud, categoria, valor, fecha, descripcion`

## Archivos
- `App.jsx` consulta Supabase, calcula los indicadores y dibuja el mapa
- `supabaseClient.js` conexión a Supabase (clave pública)
- `main.jsx`, `index.html`, `styles.css` base de la aplicación

## Ejecutar en local
```
npm install
npm run dev
```
