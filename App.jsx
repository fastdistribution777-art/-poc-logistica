import { useEffect, useMemo, useRef, useState } from 'react'
import DeckGL from '@deck.gl/react'
import { ScatterplotLayer } from '@deck.gl/layers'
import { HeatmapLayer } from '@deck.gl/aggregation-layers'
import Map from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import { supabase } from './supabaseClient'

// ---- Configuración ----
const TITULO = 'Mapa de Entregas – Gran Buenos Aires'
const UMBRAL_CRITICO = 100 // minutos: a partir de acá la entrega se considera demorada
const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json'

const VISTA_INICIAL = {
  longitude: -58.55,
  latitude: -34.62,
  zoom: 9.3,
  pitch: 0,
  bearing: 0,
}

const COLORES = {
  Entregado: [27, 158, 140],
  'En camino': [233, 162, 59],
  Pendiente: [214, 69, 69],
}
const ESTADOS = ['Entregado', 'En camino', 'Pendiente']

// "-34.6037,-58.3816"  ->  { lat: -34.6037, lng: -58.3816 }
function parseCoordenadas(texto) {
  const [lat, lng] = String(texto).split(',').map((n) => Number(n.trim()))
  return { lat, lng }
}

export default function App() {
  const [puntos, setPuntos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [estado, setEstado] = useState('Todos')
  const [vista, setVista] = useState('puntos') // 'puntos' | 'calor'
  const [hover, setHover] = useState(null) // { x, y, obj } al pasar el mouse
  const [seleccion, setSeleccion] = useState(null) // punto elegido con clic
  const mapaRef = useRef(null)

  // Etapa 4: consultar la tabla "puntos" en Supabase
  useEffect(() => {
    async function cargar() {
      const { data, error } = await supabase
        .from('puntos')
        .select('id, nombre, direccion, zona, coordenadas, categoria, valor, fecha, descripcion')

      console.log('Respuesta de Supabase:', data, error) // para comprobar que llegan los datos

      if (error) {
        setError(error.message)
      } else {
        const limpios = data
          .map((p) => ({ ...p, ...parseCoordenadas(p.coordenadas), valor: Number(p.valor) }))
          .filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng))
        setPuntos(limpios)
      }
      setCargando(false)
    }
    cargar()
  }, [])

  const visibles = useMemo(
    () => (estado === 'Todos' ? puntos : puntos.filter((p) => p.categoria === estado)),
    [puntos, estado]
  )

  // Etapa 7: indicadores calculados con los datos de Supabase
  const total = visibles.length
  const promedio = total ? visibles.reduce((s, p) => s + p.valor, 0) / total : 0
  const criticos = visibles.filter((p) => p.valor >= UMBRAL_CRITICO).length

  // Etapa 5: capas de deck.gl. La posición es [longitud, latitud]
  const layers = [
    vista === 'puntos' &&
      new ScatterplotLayer({
        id: 'entregas',
        data: visibles,
        getPosition: (p) => [p.lng, p.lat],
        getFillColor: (p) => [...(COLORES[p.categoria] || [120, 120, 120]), 215],
        getLineColor: (p) => (seleccion && p.id === seleccion.id ? [20, 33, 61, 255] : [255, 255, 255, 255]),
        getLineWidth: (p) => (seleccion && p.id === seleccion.id ? 4 : 1.5),
        getRadius: (p) => 5 + p.valor / 9, // más demora = punto más grande
        radiusUnits: 'pixels',
        lineWidthUnits: 'pixels',
        stroked: true,
        updateTriggers: { getLineColor: [seleccion], getLineWidth: [seleccion] },
        pickable: true,
        autoHighlight: true,
        highlightColor: [20, 33, 61, 120],
      }),
    vista === 'calor' &&
      new HeatmapLayer({
        id: 'calor',
        data: visibles,
        getPosition: (p) => [p.lng, p.lat],
        getWeight: (p) => p.valor,
        radiusPixels: 55,
        intensity: 1.4,
        threshold: 0.05,
      }),
  ].filter(Boolean)

  // Etapa 6: información al pasar el mouse (tooltip propio) y al hacer clic (panel)
  const alPasarMouse = (info) => {
    setHover(info && info.object ? { x: info.x, y: info.y, obj: info.object } : null)
  }
  const alHacerClic = (info) => {
    setSeleccion(info && info.object ? info.object : null)
  }

  return (
    <div className="app">
      <header className="top">
        <div className="titulo">
          <h1>{TITULO}</h1>
          <p>Tiempo de entrega por pedido. Los puntos grandes son las entregas más demoradas.</p>
        </div>

        <div className="kpis">
          <div className="kpi">
            <b>{total}</b>
            <span>Pedidos registrados</span>
          </div>
          <div className="kpi">
            <b>{promedio.toFixed(0)} min</b>
            <span>Tiempo promedio de entrega</span>
          </div>
          <div className="kpi alerta">
            <b>{criticos}</b>
            <span>Entregas críticas (más de {UMBRAL_CRITICO} min)</span>
          </div>
        </div>
      </header>

      <main className="mapa" ref={mapaRef}>
        <DeckGL
          initialViewState={VISTA_INICIAL}
          controller={true}
          layers={layers}
          onHover={alPasarMouse}
          onClick={alHacerClic}
          getCursor={({ isHovering }) => (isHovering ? 'pointer' : 'grab')}
        >
          <Map mapStyle={MAP_STYLE} />
        </DeckGL>

        <div className="panel">
          <div className="grupo" role="group" aria-label="Filtrar por estado">
            {['Todos', ...ESTADOS].map((e) => (
              <button
                key={e}
                className={estado === e ? 'chip activo' : 'chip'}
                onClick={() => setEstado(e)}
              >
                {e !== 'Todos' && (
                  <i style={{ background: `rgb(${COLORES[e].join(',')})` }} />
                )}
                {e}
              </button>
            ))}
          </div>
          <div className="grupo" role="group" aria-label="Tipo de visualización">
            <button
              className={vista === 'puntos' ? 'chip activo' : 'chip'}
              onClick={() => setVista('puntos')}
            >
              Puntos
            </button>
            <button
              className={vista === 'calor' ? 'chip activo' : 'chip'}
              onClick={() => setVista('calor')}
            >
              Mapa de calor
            </button>
          </div>
        </div>

        {hover && vista === 'puntos' && (
          <div
            className="tt"
            style={{
              left:
                hover.x > (mapaRef.current?.clientWidth || 1000) - 290
                  ? hover.x - 270
                  : hover.x + 14,
              top: hover.y + 14,
            }}
          >
            <strong>{hover.obj.nombre}</strong>
            <div>{hover.obj.descripcion}</div>
            <div><span>Dirección:</span> {hover.obj.direccion}</div>
            <div><span>Categoría:</span> {hover.obj.categoria}</div>
            <div><span>Valor:</span> {hover.obj.valor} min</div>
          </div>
        )}

        {seleccion && (
          <aside className="detalle">
            <button className="cerrar" onClick={() => setSeleccion(null)} aria-label="Cerrar">×</button>
            <h2>{seleccion.nombre}</h2>
            <p>{seleccion.descripcion}</p>
            <dl>
              <dt>Dirección</dt><dd>{seleccion.direccion}</dd>
              <dt>Zona</dt><dd>{seleccion.zona}</dd>
              <dt>Categoría</dt><dd>{seleccion.categoria}</dd>
              <dt>Valor</dt><dd>{seleccion.valor} min</dd>
              <dt>Fecha</dt><dd>{seleccion.fecha}</dd>
            </dl>
          </aside>
        )}

        {cargando && <div className="aviso">Cargando pedidos…</div>}
        {error && (
          <div className="aviso error">
            No se pudieron cargar los datos: {error}. Revisá las credenciales de Supabase.
          </div>
        )}
        {!cargando && !error && puntos.length === 0 && (
          <div className="aviso error">
            La tabla no devolvió registros. Revisá que tenga datos y la política de lectura pública.
          </div>
        )}
      </main>
    </div>
  )
}
