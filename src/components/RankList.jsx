import { useState, useMemo, useEffect, useRef } from 'react'
import { useUser, UserButton } from '@clerk/react'

// Defined at module scope so React sees a stable component type across renders.
// If defined inside RankList, React would unmount + remount DOM nodes on every
// parent render.
function Stepper({ value, set, max }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button onClick={() => set(v => Math.max(0, v - 1))} style={{ width: '24px', height: '24px', borderRadius: '4px', border: '1px solid var(--color-border)', background: 'var(--color-surface-muted)', color: 'var(--color-text-secondary)', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
            <span style={{ minWidth: '28px', textAlign: 'center', fontSize: '13px', fontWeight: 600, color: value > 0 ? 'var(--color-accent)' : 'var(--color-text-secondary)' }}>{value}+</span>
            <button onClick={() => set(v => Math.min(max, v + 1))} style={{ width: '24px', height: '24px', borderRadius: '4px', border: '1px solid var(--color-border)', background: 'var(--color-surface-muted)', color: 'var(--color-text-secondary)', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
        </div>
    )
}

export default function RankList({
    neighborhoods, selectedId, compareIds = new Set(),
    showCompareButtons, onSelect, onCompare, onAbout, onCollapse
}) {
    const { isSignedIn, isLoaded } = useUser()
    const [sortDir, setSortDir] = useState('desc')
    const [minScore, setMinScore] = useState(0)
    const [infraOpen, setInfraOpen] = useState(false)
    const [minHospitals, setMinHospitals] = useState(0)
    const [minSchools, setMinSchools] = useState(0)
    const [minTransit, setMinTransit] = useState(0)
    const [hoveredId, setHoveredId] = useState(null)

    // Search and Dropdown Filter States
    const [searchQuery, setSearchQuery] = useState('')
    const [activeRegions, setActiveRegions] = useState(null)
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [displayLimit, setDisplayLimit] = useState(100)

    const dropdownRef = useRef(null)

    // Automatically detect unique regions in the dataset
    const availableRegions = useMemo(() => {
        const regions = new Set(neighborhoods.map(n => n.region))
        return Array.from(regions).sort()
    }, [neighborhoods])

    // Helper to get active regions set
    const regionsSet = useMemo(() => {
        return activeRegions !== null ? activeRegions : new Set(availableRegions)
    }, [activeRegions, availableRegions])

    // Close dropdown on click outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Reset pagination when filter criteria change
    useEffect(() => {
        setDisplayLimit(100)
    }, [searchQuery, activeRegions, minScore, minHospitals, minSchools, minTransit, sortDir])

    function toggleRegion(r) {
        setActiveRegions(prev => {
            const current = prev !== null ? prev : new Set(availableRegions)
            const next = new Set(current)
            if (next.has(r)) {
                next.delete(r)
            } else {
                next.add(r)
            }
            return next
        })
    }

    function selectAllRegions() {
        setActiveRegions(new Set(availableRegions))
    }

    function clearAllRegions() {
        setActiveRegions(new Set())
    }

    const filtered = useMemo(() => {
        return neighborhoods
            .filter(n => {
                // Region Filter
                if (!regionsSet.has(n.region)) return false
                
                // Name Search Filter
                if (searchQuery.trim() !== '') {
                    if (!n.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
                }
                
                // Score Filter
                if (n.prospectScore < minScore) return false
                
                // Infrastructure Filter
                const infra = n.infrastructure || {}
                if ((infra.hospitals        || 0) < minHospitals) return false
                if ((infra.schools          || 0) < minSchools)   return false
                if ((infra.railway_stations || 0) < minTransit)   return false
                
                return true
            })
            .sort((a, b) => sortDir === 'desc'
                ? b.prospectScore - a.prospectScore
                : a.prospectScore - b.prospectScore)
    }, [neighborhoods, sortDir, regionsSet, searchQuery, minScore, minHospitals, minSchools, minTransit])

    const displayedItems = useMemo(() => {
        return filtered.slice(0, displayLimit)
    }, [filtered, displayLimit])

    const infraActive = minHospitals > 0 || minSchools > 0 || minTransit > 0

    return (
        <div className="rank-list">
            {/* Header — always visible, with collapse button */}
            <div className="rank-list__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <button className="rank-list__wordmark" onClick={onAbout} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left' }}>
                        Urban Prospect
                    </button>
                    <div className="rank-list__subtitle">Italy — Prospect Score ranking</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {isLoaded && isSignedIn && (
                        <UserButton afterSignOutUrl="/" />
                    )}
                    <button
                        onClick={onCollapse}
                        title="Collapse sidebar"
                        style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: 'var(--color-accent)', fontSize: '14px',
                            padding: '2px 4px', marginTop: '2px', lineHeight: 1,
                        }}
                    >›</button>
                </div>
            </div>

            <div className="rank-controls">
                {/* Sleek Search Bar */}
                <div className="rank-controls__search">
                    <span className="rank-controls__search-icon">🔍</span>
                    <input
                        type="text"
                        className="rank-controls__search-input"
                        placeholder="Search municipality..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="rank-controls__sort">
                    <button className={`rank-controls__sort-btn${sortDir === 'desc' ? ' active' : ''}`} onClick={() => setSortDir('desc')}>↓ Highest first</button>
                    <button className={`rank-controls__sort-btn${sortDir === 'asc' ? ' active' : ''}`} onClick={() => setSortDir('asc')}>↑ Lowest first</button>
                </div>

                {/* Region Floating Dropdown */}
                <div className="rank-controls__filters">
                    <div className="rank-controls__filter-label">Region</div>
                    <div className={`region-dropdown${dropdownOpen ? ' open' : ''}`} ref={dropdownRef}>
                        <button
                            type="button"
                            className="region-dropdown__toggle"
                            onClick={() => setDropdownOpen(p => !p)}
                        >
                            <span>
                                {activeRegions === null || activeRegions.size === availableRegions.length
                                    ? 'All Regions'
                                    : activeRegions.size === 0
                                    ? 'No Regions Selected'
                                    : `${activeRegions.size} Selected`}
                            </span>
                            <span className="region-dropdown__toggle-arrow">▼</span>
                        </button>
                        
                        {dropdownOpen && (
                            <div className="region-dropdown__menu">
                                <div className="region-dropdown__actions">
                                    <button
                                        type="button"
                                        className="region-dropdown__action-btn"
                                        onClick={selectAllRegions}
                                    >
                                        Select All
                                    </button>
                                    <button
                                        type="button"
                                        className="region-dropdown__action-btn"
                                        onClick={clearAllRegions}
                                    >
                                        Clear All
                                    </button>
                                </div>
                                <div className="region-dropdown__list">
                                    {availableRegions.map(r => {
                                        const isChecked = regionsSet.has(r)
                                        return (
                                            <div
                                                key={r}
                                                className="region-dropdown__item"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    toggleRegion(r)
                                                }}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    readOnly
                                                />
                                                <span className="region-dropdown__item-label">{r}</span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Score Filter */}
                <div className="rank-controls__filters" style={{ paddingTop: '4px', paddingBottom: '4px' }}>
                    <div className="rank-controls__filter-label">Min score</div>
                    <div className="rank-controls__score-range">
                        <span>{minScore}</span>
                        <input type="range" min={0} max={90} step={5} value={minScore} onChange={e => setMinScore(Number(e.target.value))} />
                        <span>100</span>
                    </div>
                </div>

                {/* Infrastructure Filters */}
                <div className="rank-controls__filters" style={{ paddingTop: '4px' }}>
                    <button onClick={() => setInfraOpen(p => !p)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
                        <span className="rank-controls__filter-label" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                            Infrastructure
                            {infraActive && <span style={{ background: 'var(--color-accent)', color: '#fff', borderRadius: '8px', padding: '1px 6px', fontSize: '9px', fontWeight: 700 }}>ON</span>}
                        </span>
                        <span style={{ fontSize: '9px', color: 'var(--color-text-tertiary)' }}>{infraOpen ? '▲' : '▼'}</span>
                    </button>

                    {infraOpen && (
                        <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {[
                                { label: '🏥 Hospitals', value: minHospitals, set: setMinHospitals, max: 10 },
                                { label: '🏫 Schools',   value: minSchools,   set: setMinSchools,   max: 20 },
                                { label: '🚂 Railway',   value: minTransit,   set: setMinTransit,   max: 10 },
                            ].map(({ label, value, set, max }) => (
                                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>{label}</span>
                                    <Stepper value={value} set={set} max={max} />
                                </div>
                            ))}
                            {infraActive && (
                                <button onClick={() => { setMinHospitals(0); setMinSchools(0); setMinTransit(0) }} style={{ fontSize: '10px', color: 'var(--color-text-tertiary)', background: 'none', border: '1px solid var(--color-border)', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', alignSelf: 'flex-start' }}>Reset</button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* List count */}
            <div className="rank-list__label">
                {filtered.length === neighborhoods.length 
                    ? `All ${filtered.length} municipalities` 
                    : `${filtered.length} of ${neighborhoods.length} municipalities`}
            </div>

            {/* Scrollable list items */}
            <div className="rank-list__items">
                {displayedItems.map((n, idx) => {
                    const isSelected = selectedId === n.id
                    const isCompared = compareIds?.has(n.id)
                    const isHovered  = hoveredId === n.id
                    const showBtn = isHovered || isCompared || showCompareButtons

                    return (
                        <div
                            key={n.id}
                            className={`rank-item${isSelected ? ' active' : ''}`}
                            onClick={() => onSelect(n)}
                            onMouseEnter={() => setHoveredId(n.id)}
                            onMouseLeave={() => setHoveredId(null)}
                            role="button" tabIndex={0}
                            onKeyDown={e => e.key === 'Enter' && onSelect(n)}
                        >
                            <span className="rank-item__rank">{idx + 1}</span>
                            <div className="rank-item__info">
                                <div className="rank-item__name">{n.name}</div>
                                <div className="rank-item__score-bar-wrap">
                                    <div className="rank-item__score-bar" style={{ width: `${n.prospectScore}%` }} />
                                </div>
                            </div>
                            
                            {!showBtn && (
                                <span className="rank-item__score-val">{n.prospectScore}</span>
                            )}
                            
                            {showBtn && (
                                <button
                                    onClick={e => { e.stopPropagation(); onCompare(n) }}
                                    title={isCompared ? 'Remove from compare' : 'Add to compare'}
                                    style={{
                                        width: '44px', height: '22px', flexShrink: 0,
                                        background: isCompared ? 'var(--color-accent)' : 'var(--color-surface-muted)',
                                        border: `1px solid ${isCompared ? 'var(--color-accent)' : 'var(--color-border)'}`,
                                        borderRadius: '4px', fontSize: '10px',
                                        cursor: 'pointer',
                                        color: isCompared ? '#fff' : 'var(--color-text-tertiary)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        gap: '2px',
                                    }}
                                >
                                    {isCompared ? '✓ ⇄' : '⇄'}
                                </button>
                            )}
                        </div>
                    )
                })}

                {/* Paginated Load More Button */}
                {filtered.length > displayLimit && (
                    <button
                        className="rank-list__load-more"
                        onClick={() => setDisplayLimit(prev => prev + 100)}
                    >
                        Show More (+100)
                    </button>
                )}
            </div>
        </div>
    )
}
