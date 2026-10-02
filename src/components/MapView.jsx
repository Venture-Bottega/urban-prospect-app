import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { cartoTiles, BASEMAP_ATTRIBUTION } from '../utils/basemap'

// Data files live beside the deployed app. VITE_DATA_BASE_URL lets a local
// checkout read them from the live site instead of carrying ~390 MB of
// GeoJSON in the repository.
const DATA_BASE = import.meta.env.VITE_DATA_BASE_URL ?? import.meta.env.BASE_URL

function scoreToColor(score, min, max) {
    const t = Math.max(0, Math.min(1, (score - min) / (max - min || 1)))
    if (t < 0.33) {
        const t2 = t / 0.33
        return `rgb(${Math.round(140+(230-140)*t2)},${Math.round(50+(100-50)*t2)},${Math.round(160+(30-160)*t2)})`
    } else if (t < 0.66) {
        const t2 = (t - 0.33) / 0.33
        return `rgb(${Math.round(230+(220-230)*t2)},${Math.round(100+(210-100)*t2)},${Math.round(30+(60-30)*t2)})`
    } else {
        const t2 = (t - 0.66) / 0.34
        return `rgb(${Math.round(220+(34-220)*t2)},${Math.round(210+(139-210)*t2)},${Math.round(60+(34-60)*t2)})`
    }
}

// LISA quadrant colours
const LISA_COLORS = {
    HH: '#1a7a4a',  // growth corridor   — signal green
    HL: '#c47b00',  // isolated performer — amber
    LH: '#4a7ab5',  // lagging area       — muted blue
    LL: '#8b3535',  // cold spot          — dark red
    ns: '#c8c4bc',  // not significant    — warm gray
}
function lisaToColor(label) { return LISA_COLORS[label] ?? LISA_COLORS.ns }

const LISA_LEGEND = [
    { label: 'HH', text: 'Growth Corridor' },
    { label: 'HL', text: 'Isolated Performer' },
    { label: 'LH', text: 'Lagging Area' },
    { label: 'LL', text: 'Cold Spot' },
    { label: 'ns', text: 'Not Significant' },
]

// Price LISA colours — investment-signal semantics
const PRICE_LISA_COLORS = {
    HH: '#b8860b',  // gold    — premium established market
    HL: '#b85c1a',  // rust    — potentially overpriced island
    LH: '#10b981',  // emerald — ★ undervalued opportunity (low price, high-price neighbours)
    LL: '#526080',  // slate   — depressed market
    ns: '#c8c4bc',  // gray    — not significant / no data
}
function lisaPriceToColor(label) { return PRICE_LISA_COLORS[label] ?? PRICE_LISA_COLORS.ns }

const PRICE_LISA_LEGEND = [
    { label: 'HH', text: 'Premium Cluster' },
    { label: 'HL', text: 'Overpriced Island' },
    { label: 'LH', text: '★ Undervalued Opportunity' },
    { label: 'LL', text: 'Depressed Market' },
    { label: 'ns', text: 'No Data / Not Significant' },
]

// Returns border style based on zoom:
//   < 7  → border = fill color (canvas anti-aliasing gaps invisible, no white blob)
//   ≥ 7  → white borders, weight grows with zoom
function borderStyle(zoom, fillColor) {
    if (zoom < 7)  return { color: fillColor, weight: 0.5 }
    if (zoom < 9)  return { color: '#ffffff', weight: 0.6 }
    return              { color: '#ffffff', weight: 1.0 }
}

export default function MapView({ neighborhoods: data, selectedId, compareIds = new Set(), weights, onSelect, sidebarOpen = true, mapMode = 'score' }) {
    const mapRef         = useRef(null)
    const mapInstanceRef = useRef(null)
    const layersRef      = useRef({})
    const scoreMapRef    = useRef({})   // id → current score
    const fillMapRef     = useRef({})   // id → current fill color
    const rafRef         = useRef(null) // requestAnimationFrame handle
    const [layersLoaded, setLayersLoaded] = useState(false)

    // Sync refs to prevent stale closures in leaflet event handlers
    const selectedIdRef = useRef(selectedId)
    const compareIdsRef = useRef(compareIds)
    const mapModeRef    = useRef(mapMode)
    useEffect(() => { selectedIdRef.current = selectedId }, [selectedId])
    useEffect(() => { compareIdsRef.current = compareIds }, [compareIds])
    useEffect(() => { mapModeRef.current    = mapMode    }, [mapMode])

    // Build score lookup from data prop (runs on every render but is cheap)
    const scores   = data.map(n => n.prospectScore)
    const DATA_MIN = Math.min(...scores)
    const DATA_MAX = Math.max(...scores)
    data.forEach(n => { scoreMapRef.current[n.id] = n.prospectScore })

    useEffect(() => {
        if (mapInstanceRef.current) return

        // Build a lookup from the data prop (already available at mount time)
        const dataMap = Object.fromEntries(data.map(n => [n.id, n]))

        const renderer = L.canvas({ padding: 0.5 })
        const map = L.map(mapRef.current, {
            center: [42.5, 12.5], zoom: 6,
            zoomControl: true, attributionControl: true,
            renderer,
        })

        L.tileLayer(cartoTiles('light_nolabels'), {
            attribution: BASEMAP_ATTRIBUTION,
            subdomains: 'abcd', maxZoom: 19,
        }).addTo(map)

        // Labels ride on top of the base layer, which already carries the
        // attribution — Leaflet would otherwise print it twice.
        L.tileLayer(cartoTiles('light_only_labels'), {
            attribution: '', subdomains: 'abcd', maxZoom: 19, pane: 'overlayPane',
        }).addTo(map)

        mapInstanceRef.current = map

        fetch(`${DATA_BASE}municipalities.geojson`)
            .then(r => r.json())
            .then(geojson => {
                const geoLayer = L.geoJSON(geojson, {
                    renderer,
                    style: (feature) => {
                        const id    = feature.properties.id
                        const score = scoreMapRef.current[id] ?? ((DATA_MIN + DATA_MAX) / 2)
                        const fill  = scoreToColor(score, DATA_MIN, DATA_MAX)
                        fillMapRef.current[id] = fill
                        const { color, weight } = borderStyle(map.getZoom(), fill)
                        return { fillColor: fill, fillOpacity: 0.88, color, weight, opacity: 1 }
                    },
                    onEachFeature: (feature, layer) => {
                        const id    = feature.properties.id
                        const entry = dataMap[id]
                        layersRef.current[id] = layer

                        const name    = feature.properties.name
                        const imd     = entry?.indicators?.[0]?.value?.toFixed(1) ?? '–'
                        const tcd     = entry?.indicators?.[1]?.value?.toFixed(1)
                        const pop     = entry?.indicators?.[2]?.value
                        const drv     = entry?.indicators?.[3]?.value
                        const drvCity = entry?.indicators?.[3]?.nearestCity ?? 'city'

                        layer.bindTooltip(
                            `<strong>${name}</strong><br/>` +
                            `Prospect Score: <b>${(scoreMapRef.current[id] ?? 0).toFixed(1)}</b><br/>` +
                            `Imperviousness: ${imd}%` +
                            (tcd != null ? `<br/>Tree Cover: ${tcd}%` : '') +
                            (pop != null ? `<br/>Pop. Growth: ${pop > 0 ? '+' : ''}${pop.toFixed(1)}%` : '') +
                            (drv != null ? `<br/>Drive to ${drvCity}: ${Math.round(drv)} min` : ''),
                            { sticky: true }
                        )

                        layer.on('click', () => {
                            const neighborhood = data.find(n => n.id === id)
                            if (neighborhood) onSelect(neighborhood)
                        })
                        layer.on('mouseover', function () {
                            if (id !== selectedIdRef.current)
                                this.setStyle({ fillOpacity: 0.97, color: 'rgba(0,0,0,0.5)', weight: 2 })
                        })
                        layer.on('mouseout', function () {
                            if (id !== selectedIdRef.current && !compareIdsRef.current.has(id)) {
                                const fill = fillMapRef.current[id] ?? scoreToColor(scoreMapRef.current[id] ?? 50, DATA_MIN, DATA_MAX)
                                const { color, weight } = borderStyle(map.getZoom(), fill)
                                this.setStyle({ fillOpacity: 0.88, color, weight })
                            }
                        })
                    },
                }).addTo(map)

                // On zoom: update borders for all non-selected layers
                map.on('zoomend', () => {
                    const z = map.getZoom()
                    geoLayer.eachLayer(layer => {
                        const id = layer.feature?.properties?.id
                        if (!id || id === selectedIdRef.current || compareIdsRef.current.has(id)) return
                        const fill = fillMapRef.current[id] ?? scoreToColor(scoreMapRef.current[id] ?? 50, DATA_MIN, DATA_MAX)
                        const { color, weight } = borderStyle(z, fill)
                        layer.setStyle({ color, weight })
                    })
                })
                setLayersLoaded(true)
            })
    }, [])

    // Recolor map when scores or map mode change — batched via requestAnimationFrame
    useEffect(() => {
        const scores = data.map(n => n.prospectScore)
        const min    = Math.min(...scores)
        const max    = Math.max(...scores)

        // Pre-build fast id lookups (O(n), not O(n²) per layer)
        const scoreById     = {}
        const lisaById      = {}
        const lisaPriceById = {}
        data.forEach(n => {
            scoreById[n.id]     = n.prospectScore
            lisaById[n.id]      = n.lisa?.label       ?? 'ns'
            lisaPriceById[n.id] = n.lisa_price?.label ?? 'ns'
        })

        const entries = Object.entries(layersRef.current)
        let idx = 0
        const BATCH = 300  // layers per animation frame

        if (rafRef.current) cancelAnimationFrame(rafRef.current)

        function processBatch() {
            const end = Math.min(idx + BATCH, entries.length)
            for (; idx < end; idx++) {
                const [id, layer] = entries[idx]
                if (id === selectedId || compareIds.has(id)) continue

                let fill
                if (mapMode === 'lisa') {
                    fill = lisaToColor(lisaById[id])
                } else if (mapMode === 'lisa_price') {
                    fill = lisaPriceToColor(lisaPriceById[id])
                } else {
                    const score = scoreById[id] ?? ((min + max) / 2)
                    scoreMapRef.current[id] = score
                    fill = scoreToColor(score, min, max)
                }
                fillMapRef.current[id] = fill
                layer.setStyle({ fillColor: fill })
            }
            if (idx < entries.length) {
                rafRef.current = requestAnimationFrame(processBatch)
            }
        }

        rafRef.current = requestAnimationFrame(processBatch)
        return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
    }, [data, mapMode])

    // Highlight selected + compare layers
    useEffect(() => {
        Object.entries(layersRef.current).forEach(([id, layer]) => {
            if (id === selectedId) {
                layer.setStyle({ fillOpacity: 0.97, weight: 5.5, color: '#00cc77', opacity: 1 })
                layer.bringToFront()
                
                // Smooth Fly-Pan and Zoom to the selected municipality's boundaries
                if (mapInstanceRef.current) {
                    try {
                        mapInstanceRef.current.flyToBounds(layer.getBounds(), { maxZoom: 9, padding: [40, 40], duration: 1.2 })
                    } catch {}
                }
            } else if (compareIds.has(id)) {
                layer.setStyle({ fillOpacity: 0.97, weight: 4.0, color: '#4da6ff', opacity: 1 })
                layer.bringToFront()
            } else {
                const fill = fillMapRef.current[id] ?? scoreToColor(scoreMapRef.current[id] ?? 50, DATA_MIN, DATA_MAX)
                const map  = mapInstanceRef.current
                const { color, weight } = borderStyle(map ? map.getZoom() : 6, fill)
                layer.setStyle({ fillOpacity: 0.88, color, weight, opacity: 1 })
            }
        })
    }, [selectedId, compareIds, layersLoaded])

    const minScore = Math.min(...data.map(n => n.prospectScore))
    const maxScore = Math.max(...data.map(n => n.prospectScore))

    return (
        <>
            <div ref={mapRef} style={{ width: '100%', height: '100%' }} />

            {/* ── Legend: switches between Score gradient / LISA / Price LISA ── */}
            {mapMode === 'lisa' ? (
                <div className="map-legend" style={{ left: sidebarOpen ? 'calc(var(--rank-width) + 16px)' : '16px' }}>
                    <div className="map-legend__title">LISA — Score Clusters</div>
                    {LISA_LEGEND.map(({ label, text }) => (
                        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '7px', marginTop: '5px' }}>
                            <div style={{ width: 11, height: 11, borderRadius: 2, background: LISA_COLORS[label], flexShrink: 0 }} />
                            <span style={{ fontSize: '10px', color: 'var(--color-text-secondary)', lineHeight: 1.3 }}>
                                <b>{label}</b> — {text}
                            </span>
                        </div>
                    ))}
                </div>
            ) : mapMode === 'lisa_price' ? (
                <div className="map-legend" style={{ left: sidebarOpen ? 'calc(var(--rank-width) + 16px)' : '16px' }}>
                    <div className="map-legend__title">LISA — Price Clusters</div>
                    {PRICE_LISA_LEGEND.map(({ label, text }) => (
                        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '7px', marginTop: '5px' }}>
                            <div style={{ width: 11, height: 11, borderRadius: 2, background: PRICE_LISA_COLORS[label], flexShrink: 0 }} />
                            <span style={{ fontSize: '10px', color: 'var(--color-text-secondary)', lineHeight: 1.3 }}>
                                <b>{label}</b> — {text}
                            </span>
                        </div>
                    ))}
                    <div style={{ marginTop: '8px', fontSize: '9px', color: 'var(--color-text-tertiary)', lineHeight: 1.4 }}>
                        Coverage: Toscana, Lazio,<br/>Umbria, Abruzzo
                    </div>
                </div>
            ) : (
                <div className="map-legend" style={{ left: sidebarOpen ? 'calc(var(--rank-width) + 16px)' : '16px' }}>
                    <div className="map-legend__title">Prospect Score</div>
                    <div className="map-legend__bar map-legend__bar--rainbow" />
                    <div className="map-legend__labels">
                        <span>{minScore.toFixed(0)}</span>
                        <span>{maxScore.toFixed(0)}</span>
                    </div>
                </div>
            )}

            <div className={`map-hint${selectedId ? ' hidden' : ''}`}>
                Click a comune to explore
            </div>
        </>
    )
}
