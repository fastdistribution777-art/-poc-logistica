# Mapa de Entregas – PoC de Datos Georreferenciados

Dataset → Supabase → React/Vite → deck.gl → Vercel

## Correr en tu computadora
1. Instalar Node.js (https://nodejs.org, versión LTS).
2. En una terminal, dentro de esta carpeta:
   npm install
   npm run dev
3. Abrir la dirección que aparece (normalmente http://localhost:5173).

El archivo `.env` ya tiene la URL y la clave pública de Supabase.
Para comprobar que llegan los datos: abrir la consola del navegador (F12) y buscar "Respuesta de Supabase".

## Publicar en Vercel
1. Subir esta carpeta a un repositorio de GitHub (el `.env` NO se sube, está en .gitignore).
2. En https://vercel.com → Add New → Project → importar el repositorio.
3. Antes de Deploy, abrir "Environment Variables" y cargar:
   VITE_SUPABASE_URL
   VITE_SUPABASE_KEY
   (los mismos valores del archivo .env)
4. Tocar Deploy. Vercel entrega la URL pública.

## Estructura
- src/supabaseClient.js  conexión a Supabase
- src/App.jsx            consulta, indicadores, mapa deck.gl y tooltip
- src/styles.css         estilos
