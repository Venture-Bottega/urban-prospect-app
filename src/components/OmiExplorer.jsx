import { useEffect, useRef, useState, useMemo } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { cartoTiles, BASEMAP_ATTRIBUTION } from '../utils/basemap'

// Data files live beside the deployed app. VITE_DATA_BASE_URL lets a local
// checkout read them from the live site instead of carrying ~390 MB of
// GeoJSON in the repository.
const DATA_BASE = import.meta.env.VITE_DATA_BASE_URL ?? import.meta.env.BASE_URL

export default function OmiExplorer({ comune, onClose }) {
    const [selectedTypology, setSelectedTypology] = useState('Abitazioni civili')
    const [selectedState, setSelectedState]       = useState('NORMALE')
    const [mapMode, setMapMode]                   = useState('price') // 'price' | 'growth'
    const [geoJsonData, setGeoJsonData]           = useState(null)
    const [loading, setLoading]                   = useState(true)
    const [error, setError]                       = useState(null)
    const [activeZoneId, setActiveZoneId]         = useState(null)

    const mapRef = useRef(null)
    const mapInstanceRef = useRef(null)
    const geoJsonLayerRef = useRef(null)

    // Fetch GeoJSON with OMI zones
    useEffect(() => {
        setLoading(true)
        setError(null)
        setActiveZoneId(null)
        
        fetch(`${DATA_BASE}omi_zones/${comune.id}.geojson`)
            .then(res => {
                if (!res.ok) {
                    throw new Error("OMI Price zone boundaries are not available for this municipality.")
                }
                return res.json()
            })
            .then(data => {
                setGeoJsonData(data)
                setLoading(false)
            })
            .catch(() => {
                setError("OMI Price zone boundaries are not available for this municipality.")
                setLoading(false)
            })
    }, [comune.id])

    // Get list of all available typologies in this comune's price zones
    const availableTypologies = useMemo(() => {
        if (!geoJsonData) return ['Abitazioni civili']
        const typs = new Set()
        geoJsonData.features.forEach(f => {
            if (f.properties?.prices) {
                Object.keys(f.properties.prices).forEach(t => typs.add(t))
            }
        })
        return typs.size > 0 ? Array.from(typs) : ['Abitazioni civili']
    }, [geoJsonData])

    // Automatically select the first available typology if current is not in the list
    useEffect(() => {
        if (availableTypologies.length > 0 && !availableTypologies.includes(selectedTypology)) {
            setSelectedTypology(availableTypologies[0])
        }
    }, [availableTypologies, selectedTypology])

    // Extract price and growth stats across all zones for color bounds
    const stats = useMemo(() => {
        if (!geoJsonData) return { minPrice: 0, maxPrice: 1000, minGrowth: -10, maxGrowth: 10 }
        
        const prices = []
        const growths = []
        
        geoJsonData.features.forEach(f => {
            const p = f.properties?.prices?.[selectedTypology]?.[selectedState]
            if (p) {
                if (p.price_2024?.mid) prices.push(p.price_2024.mid)
                if (p.growth_pct !== null && p.growth_pct !== undefined) growths.push(p.growth_pct)
            }
        })
        
        return {
            minPrice: prices.length > 0 ? Math.min(...prices) : 0,
            maxPrice: prices.length > 0 ? Math.max(...prices) : 1000,
            minGrowth: growths.length > 0 ? Math.min(...growths) : -10,
            maxGrowth: growths.length > 0 ? Math.max(...growths) : 10
        }
    }, [geoJsonData, selectedTypology, selectedState])

    // Diverging and single-hue coloring functions
    function getColor(value, mode) {
        if (value === null || value === undefined) return '#d8d7d4' // gray fallback
        
        if (mode === 'price') {
            const { minPrice, maxPrice } = stats
            const range = maxPrice - minPrice || 1
            const linearT = Math.max(0, Math.min(1, (value - minPrice) / range))
            // Use a square root (power 0.5) scaling to spread out colors at the lower/middle range
            const t = Math.pow(linearT, 0.5)
            // Premium bluish gradient (ice blue to deep sapphire royal blue)
            const hue = Math.round(200 + t * 30)
            const sat = Math.round(40 + t * 40)
            const light = Math.round(90 - t * 65)
            return `hsl(${hue}, ${sat}%, ${light}%)`
        } else {
            // Diverging growth scale: negative = orange/red, stable = gray, positive = green
            if (value > 0) {
                // Positives: up to +35% mapped to full green
                const t = Math.min(1, value / 35.0)
                return `hsl(140, 50%, ${82 - t * 34}%)`
            } else if (value < 0) {
                // Negatives: down to -20% mapped to full red
                const t = Math.min(1, Math.abs(value) / 20.0)
                return `hsl(10, 75%, ${82 - t * 25}%)`
            } else {
                return '#eae9e6' // zero change
            }
        }
    }

    // Initialize map
    useEffect(() => {
        if (loading || error || !geoJsonData || !mapRef.current) return

        // Cleanup existing map
        if (mapInstanceRef.current) {
            mapInstanceRef.current.remove()
            mapInstanceRef.current = null
        }

        const map = L.map(mapRef.current, {
            zoomControl: true,
            attributionControl: true
        })
        mapInstanceRef.current = map

        L.tileLayer(cartoTiles('light_all'), {
            attribution: BASEMAP_ATTRIBUTION,
            subdomains: 'abcd',
            maxZoom: 19
        }).addTo(map)

        // Draw boundaries
        const geojsonLayer = L.geoJSON(geoJsonData, {
            style: (feature) => {
                const props = feature.properties
                const p = props.prices?.[selectedTypology]?.[selectedState]
                const val = mapMode === 'price' ? p?.price_2024?.mid : p?.growth_pct
                
                return {
                    fillColor: getColor(val, mapMode),
                    fillOpacity: 0.8,
                    color: '#ffffff',
                    weight: 1.2,
                    opacity: 0.95
                }
            },
            onEachFeature: (feature, layer) => {
                const props = feature.properties
                const zoneId = props.cod_zona
                
                // Add click behavior
                layer.on('click', () => {
                    setActiveZoneId(zoneId)
                })

                // Mouseovers
                layer.on('mouseover', function () {
                    this.setStyle({ fillOpacity: 0.95, weight: 2.2, color: 'var(--color-accent)' })
                })
                layer.on('mouseout', function () {
                    const isSelected = zoneId === activeZoneId
                    this.setStyle({
                        fillOpacity: 0.8,
                        weight: isSelected ? 2.2 : 1.2,
                        color: isSelected ? 'var(--color-accent)' : '#ffffff'
                    })
                })
                
                const p = props.prices?.[selectedTypology]?.[selectedState]
                const priceStr = p?.price_2024 
                    ? `€${p.price_2024.min.toLocaleString()} – €${p.price_2024.max.toLocaleString()}/m²`
                    : 'No price data'
                const trendStr = p?.growth_pct !== null && p?.growth_pct !== undefined
                    ? `${p.growth_pct >= 0 ? '+' : ''}${p.growth_pct}%`
                    : 'N/A'

                layer.bindTooltip(
                    `<strong>Zone ${zoneId}</strong> - ${props.name || 'OMI Zone'}<br/>` +
                    `Current Avg: <strong>${p?.price_2024 ? '€' + p.price_2024.mid.toLocaleString() : '–'}/m²</strong><br/>` +
                    `Change (2018–2024): <strong>${trendStr}</strong>`,
                    { sticky: true }
                )
            }
        }).addTo(map)

        geoJsonLayerRef.current = geojsonLayer

        // Fit map bounds to show the entire municipality
        try {
            map.fitBounds(geojsonLayer.getBounds(), { padding: [30, 30] })
        } catch {
            map.setView([41.9, 12.9], 11)
        }

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove()
                mapInstanceRef.current = null
            }
        }
    }, [loading, error, geoJsonData])

    // Update layer styles when typology, state, or mapMode changes
    useEffect(() => {
        if (!geoJsonLayerRef.current) return
        
        geoJsonLayerRef.current.eachLayer((layer) => {
            const feature = layer.feature
            const props = feature.properties
            const p = props.prices?.[selectedTypology]?.[selectedState]
            const val = mapMode === 'price' ? p?.price_2024?.mid : p?.growth_pct
            
            layer.setStyle({
                fillColor: getColor(val, mapMode)
            })
        })
    }, [selectedTypology, selectedState, mapMode, stats])

    // Highlighting selected zone from sidebar or map click
    useEffect(() => {
        if (!geoJsonLayerRef.current) return
        
        geoJsonLayerRef.current.eachLayer((layer) => {
            const zoneId = layer.feature.properties.cod_zona
            const isSelected = zoneId === activeZoneId
            
            layer.setStyle({
                weight: isSelected ? 2.5 : 1.2,
                color: isSelected ? 'var(--color-accent)' : '#ffffff'
            })
            
            if (isSelected) {
                layer.bringToFront()
                // Pan map to polygon bounds
                if (mapInstanceRef.current) {
                    try {
                        mapInstanceRef.current.panTo(layer.getBounds().getCenter())
                    } catch {}
                }
            }
        })
    }, [activeZoneId])

    // Get active zone details card data
    const activeZone = useMemo(() => {
        if (!geoJsonData || !activeZoneId) return null
        const feat = geoJsonData.features.find(f => f.properties.cod_zona === activeZoneId)
        return feat ? feat.properties : null
    }, [geoJsonData, activeZoneId])

    return (
        <div className="omi-explorer">
            {/* Sidebar Pane */}
            <div className="omi-sidebar">
                <button className="omi-sidebar__back" onClick={onClose}>
                    ← Back to Dashboard
                </button>
                
                <div className="omi-sidebar__header">
                    <div className="omi-sidebar__tag">Municipality OMI Explorer</div>
                    <h2 className="omi-sidebar__title">{comune.name}</h2>
                    <div className="omi-sidebar__region">{comune.region} Region</div>
                    {/* The price zones shown here come from OMI; the source asks to
                        be cited wherever its data appears, and this view showed none. */}
                    <div className="omi-sidebar__source">
                        Price zones and values: Agenzia Entrate — OMI
                    </div>
                </div>

                {loading && (
                    <div className="omi-sidebar__status">
                        <div className="spinner"></div>
                        <p>Loading price zone assets...</p>
                    </div>
                )}

                {error && (
                    <div className="omi-sidebar__status error">
                        <p className="error-icon">⚠️</p>
                        <p>{error}</p>
                    </div>
                )}

                {!loading && !error && geoJsonData && (
                    <div className="omi-sidebar__scroll">
                        {/* Selector Toggles */}
                        <div className="omi-section">
                            <label className="omi-section__label">Property Typology</label>
                            <select
                                value={selectedTypology}
                                onChange={(e) => setSelectedTypology(e.target.value)}
                                className="explorer-select"
                            >
                                {availableTypologies.map(t => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                        </div>

                        <div className="omi-section">
                            <label className="omi-section__label">Map Coloring Mode</label>
                            <div className="map-mode-toggle">
                                <button
                                    onClick={() => setMapMode('price')}
                                    className={`mode-btn ${mapMode === 'price' ? 'active' : ''}`}
                                >
                                    Absolute Price
                                </button>
                                <button
                                    onClick={() => setMapMode('growth')}
                                    className={`mode-btn ${mapMode === 'growth' ? 'active' : ''}`}
                                >
                                    Price Trend (vs 2018)
                                </button>
                            </div>
                        </div>

                        {/* Detailed Card for Selected Zone */}
                        {activeZone ? (
                            <div className="omi-section active-card">
                                <div className="active-card__header">
                                    <span className="active-card__code">Zone {activeZone.cod_zona}</span>
                                    <span className="active-card__name">{activeZone.name.split('-').pop().trim()}</span>
                                </div>
                                <div className="active-card__body">
                                    <label className="omi-section__label" style={{ marginTop: 0, marginBottom: '6px' }}>
                                        Historical Comparison (2018 vs 2024)
                                    </label>
                                    <div className="trend-table">
                                        <div className="trend-row header">
                                            <span>Typology (Stato)</span>
                                            <span>2018</span>
                                            <span>2024</span>
                                            <span>Change</span>
                                        </div>
                                        {Object.entries(activeZone.prices).map(([typ, states]) => {
                                            const sData = states[selectedState]
                                            if (!sData) return null
                                            
                                            const rawGrowth = sData.growth_pct
                                            const hasGrowth = rawGrowth !== null && rawGrowth !== undefined
                                            
                                            return (
                                                <div 
                                                    key={typ} 
                                                    className={`trend-row ${typ === selectedTypology ? 'highlighted' : ''}`}
                                                >
                                                    <span className="trend-typ">{typ}</span>
                                                    <span>{sData.price_2018 ? `€${sData.price_2018.mid}` : '–'}</span>
                                                    <span style={{ fontWeight: 600 }}>{sData.price_2024 ? `€${sData.price_2024.mid}` : '–'}</span>
                                                    <span className={hasGrowth ? (rawGrowth >= 0 ? 'trend-green' : 'trend-red') : 'trend-gray'}>
                                                        {hasGrowth ? `${rawGrowth >= 0 ? '+' : ''}${rawGrowth}%` : 'N/A'}
                                                    </span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="omi-section active-card-placeholder">
                                Click a zone on the map or list below to view comparison trends.
                            </div>
                        )}

                        {/* Zone List */}
                        <div className="omi-section">
                            <label className="omi-section__label">Zone Pricing Index ({selectedTypology})</label>
                            <div className="zone-list">
                                {geoJsonData.features.map(f => {
                                    const props = f.properties
                                    const p = props.prices?.[selectedTypology]?.[selectedState]
                                    const isSelected = props.cod_zona === activeZoneId
                                    
                                    const changePct = p?.growth_pct
                                    const hasGrowth = changePct !== null && changePct !== undefined
                                    
                                    return (
                                        <div 
                                            key={props.cod_zona}
                                            onClick={() => setActiveZoneId(props.cod_zona)}
                                            className={`zone-list-item ${isSelected ? 'active' : ''}`}
                                        >
                                            <div className="zone-list-item__left">
                                                <span className="zone-list-item__code">{props.cod_zona}</span>
                                                <span className="zone-list-item__name">
                                                    {props.name.split('-').pop().trim()}
                                                </span>
                                            </div>
                                            <div className="zone-list-item__right">
                                                <span className="zone-list-item__price">
                                                    {p?.price_2024 
                                                        ? `€${p.price_2024.mid}/m²` 
                                                        : '–'}
                                                </span>
                                                {hasGrowth && (
                                                    <span className={`growth-badge ${changePct >= 0 ? 'pos' : 'neg'}`}>
                                                        {changePct >= 0 ? '+' : ''}{changePct}%
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Map Canvas */}
            <div className="omi-map-container">
                <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
                
                {/* Custom Map Legend */}
                {!loading && !error && geoJsonData && (
                    <div className="explorer-legend">
                        <div className="explorer-legend__title">
                            {mapMode === 'price' 
                                ? `Current Price Avg (${selectedTypology})` 
                                : `Historical Growth Rate (2018–2024)`}
                        </div>
                        {mapMode === 'price' ? (
                            <>
                                <div className="explorer-legend__bar omi-blue-gradient" />
                                <div className="explorer-legend__labels">
                                    <span>€{stats.minPrice.toLocaleString()}/m²</span>
                                    <span>€{stats.maxPrice.toLocaleString()}/m²</span>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="explorer-legend__bar omi-diverging-gradient" />
                                <div className="explorer-legend__labels">
                                    <span style={{ color: '#ad220c', fontWeight: 600 }}>Decline</span>
                                    <span style={{ color: '#6b6864' }}>Stable (0%)</span>
                                    <span style={{ color: '#166d25', fontWeight: 600 }}>Appreciation</span>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
