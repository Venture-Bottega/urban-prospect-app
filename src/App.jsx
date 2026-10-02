import { useState, useEffect, useMemo } from 'react'
import MapView from './components/MapView'
import DetailPanel from './components/DetailPanel'
import RankList from './components/RankList'
import LandingPage from './components/LandingPage'
import MainLandingPage from './components/MainLandingPage'
import AuthPage from './components/AuthPage'
import WeightsPanel from './components/WeightsPanel'
import ComparePanel from './components/ComparePanel'
import OmiExplorer from './components/OmiExplorer'
import ChatPanel from './components/ChatPanel'
import { DEFAULT_WEIGHTS, computeScore } from './utils/score'

// Data files live beside the deployed app. VITE_DATA_BASE_URL lets a local
// checkout read them from the live site instead of carrying ~390 MB of
// GeoJSON in the repository.
const DATA_BASE = import.meta.env.VITE_DATA_BASE_URL ?? import.meta.env.BASE_URL

export default function App() {
    const [selected, setSelected]         = useState(null)
    const [showLanding, setShowLanding]   = useState('main')
    const [showAuth, setShowAuth]         = useState(false)
    const [weights, setWeights]           = useState({ ...DEFAULT_WEIGHTS })
    const [compareList, setCompareList]   = useState([])   // 0, 1 or 2 items
    const [showCompare, setShowCompare]   = useState(false)
    const [scoreHistory, setScoreHistory] = useState([])
    const [sidebarOpen, setSidebarOpen]   = useState(true)
    const [exploredComune, setExploredComune] = useState(null)
    // Loaded asynchronously to avoid blocking the main thread on a 14 MB parse
    const [neighborhoods, setNeighborhoods] = useState([])
    const [dataLoaded, setDataLoaded]       = useState(false)
    // Map layer mode toggle
    const [mapMode, setMapMode]             = useState('score')   // 'score' | 'lisa'
    // AI chat panel
    const [chatOpen, setChatOpen]           = useState(false)

    useEffect(() => {
        if (showLanding) {
            document.body.classList.remove('map-active')
            window.scrollTo(0, 0)
        } else {
            document.body.classList.add('map-active')
        }
        return () => document.body.classList.remove('map-active')
    }, [showLanding])

    // Fetch municipality data asynchronously after paint so the landing page
    // renders immediately instead of blocking on a 14 MB JSON parse.
    useEffect(() => {
        fetch(`${DATA_BASE}italy_municipalities.json`)
            .then(r => r.json())
            .then(data => {
                setNeighborhoods(data)
                setDataLoaded(true)
            })
    }, [])

    const scoredNeighborhoods = useMemo(() => {
        return neighborhoods.map(n => ({
            ...n,
            prospectScore: Math.round(computeScore(n, weights) * 10) / 10,
        }))
    }, [neighborhoods, weights])

    useEffect(() => {
        if (scoredNeighborhoods.length === 0) return   // guard against empty state during load
        const topScore = Math.max(...scoredNeighborhoods.map(n => n.prospectScore))
        setScoreHistory(prev => [...prev.slice(-29), topScore])
    }, [scoredNeighborhoods])

    const sorted = [...scoredNeighborhoods].sort((a, b) => b.prospectScore - a.prospectScore)
    const selectedScored = selected
        ? scoredNeighborhoods.find(n => n.id === selected.id) ?? selected
        : null

    function handleSelect(n) {
        setSelected(n)
        setShowCompare(false)
    }

    // Toggle a comune in/out of compare list
    function handleCompare(n) {
        setCompareList(prev => {
            const already = prev.find(p => p.id === n.id)
            if (already) {
                // Deselect it
                const next = prev.filter(p => p.id !== n.id)
                if (next.length === 0) setShowCompare(false)
                return next
            }
            const next = [...prev, n].slice(-2)
            if (next.length === 2) setShowCompare(true)
            return next
        })
        setSelected(null)
    }

    function handleCloseCompare() {
        setShowCompare(false)
        setCompareList([])   // reset selections
    }

    // Gate the map view on data being loaded; landing pages render immediately.
    if (!dataLoaded && showLanding === false && !showAuth) {
        return (
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                height: '100vh', flexDirection: 'column', gap: '16px',
                background: 'var(--color-bg)',
            }}>
                <div style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-accent)' }}>Urban Prospect</div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>Loading municipality data…</div>
            </div>
        )
    }

    if (showLanding === 'main') {
        return <MainLandingPage
            onSelectUrban={() => setShowLanding('urban')}
        />
    }

    if (showLanding === 'urban') {
        return <LandingPage
            onEnter={() => { setShowLanding(false); setShowAuth(false) }}
            onSignIn={() => { setShowLanding(false); setShowAuth(true) }}
            onBack={() => setShowLanding('main')}
        />
    }

    if (showAuth) {
        return <AuthPage
            onAuthenticated={() => setShowAuth(false)}
            onBack={() => { setShowAuth(false); setShowLanding('urban') }}
        />
    }

    if (exploredComune) {
        return <OmiExplorer comune={exploredComune} onClose={() => setExploredComune(null)} />
    }

    const compareIds = new Set(compareList.map(n => n.id))

    return (
        <div className="app">
            {/* Sidebar — collapsible */}
            {sidebarOpen && (
                <RankList
                    neighborhoods={sorted}
                    selectedId={selectedScored?.id}
                    compareIds={compareIds}
                    showCompareButtons={showCompare || compareList.length > 0}
                    onSelect={handleSelect}
                    onCompare={handleCompare}
                    onAbout={() => setShowLanding('urban')}
                    onCollapse={() => setSidebarOpen(false)}
                />
            )}

            {/* Collapsed sidebar — just the header strip */}
            {!sidebarOpen && (
                <div style={{
                    width: '48px', height: '100%', flexShrink: 0,
                    background: 'var(--color-surface)',
                    borderRight: '1px solid var(--color-border)',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', paddingTop: '16px', gap: '12px',
                    zIndex: 800,
                }}>
                    {/* Expand button */}
                    {/* eslint-disable-next-line react/button-has-type */}
                    <button
                        onClick={() => setSidebarOpen(true)}
                        title="Open sidebar"
                        style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: 'var(--color-accent)', fontSize: '18px', lineHeight: 1,
                            padding: '4px',
                        }}
                    >☰</button>
                </div>
            )}

            <div className="map-container">
                {/* ── Map layer toggle: Score | LISA Score | LISA Price ── */}
                <div className="map-mode-toggle">
                    <button
                        className={`map-mode-toggle__btn${mapMode === 'score' ? ' active' : ''}`}
                        onClick={() => setMapMode('score')}
                    >
                        Prospect Score
                    </button>
                    <button
                        className={`map-mode-toggle__btn${mapMode === 'lisa' ? ' active' : ''}`}
                        onClick={() => setMapMode('lisa')}
                    >
                        LISA Score
                    </button>
                    <button
                        className={`map-mode-toggle__btn${mapMode === 'lisa_price' ? ' active' : ''}`}
                        onClick={() => setMapMode('lisa_price')}
                    >
                        LISA Price
                    </button>
                </div>

                <MapView
                    neighborhoods={scoredNeighborhoods}
                    selectedId={selectedScored?.id}
                    compareIds={compareIds}
                    weights={weights}
                    onSelect={handleSelect}
                    sidebarOpen={sidebarOpen}
                    mapMode={mapMode}
                />
                <WeightsPanel
                    weights={weights}
                    onChange={setWeights}
                    scoreHistory={scoreHistory}
                    sidebarOpen={sidebarOpen}
                />
                {showCompare && compareList.length === 2 && (
                    <ComparePanel
                        neighborhoods={compareList.map(c =>
                            scoredNeighborhoods.find(n => n.id === c.id) ?? c
                        )}
                        onClose={handleCloseCompare}
                    />
                )}

                {/* ── AI Chat button ── */}
                <button
                    className={`chat-fab${chatOpen ? ' active' : ''}`}
                    onClick={() => setChatOpen(o => !o)}
                    title="Urban Prospect AI"
                    aria-label="Open AI chat"
                >
                    {chatOpen ? '✕' : '✦ AI'}
                </button>

                {/* ── AI Chat panel ── */}
                {chatOpen && (
                    <ChatPanel
                        neighborhoods={scoredNeighborhoods}
                        onSelectMunicipality={n => { handleSelect(n); setChatOpen(false) }}
                        onClose={() => setChatOpen(false)}
                    />
                )}
            </div>

            <DetailPanel
                neighborhood={selectedScored}
                onClose={() => setSelected(null)}
                onAbout={() => setShowLanding('urban')}
                onCompare={handleCompare}
                compareIds={compareIds}
                onExplore={setExploredComune}
            />
        </div>
    )
}
