import { useState, useEffect, useRef } from 'react'

export default function MainLandingPage({ onSelectUrban }) {
    const [activeTab, setActiveTab] = useState('urban')
    const [heroIn, setHeroIn] = useState(false)
    const workbenchRef = useRef(null)

    // Dynamic SEO Metadata
    useEffect(() => {
        const prevTitle = document.title
        document.title = 'Prospect Suite | Multi-Criteria Territorial Indexes'

        // Search/Add meta description
        let metaDesc = document.querySelector('meta[name="description"]')
        const prevDesc = metaDesc ? metaDesc.getAttribute('content') : ''
        if (!metaDesc) {
            metaDesc = document.createElement('meta')
            metaDesc.name = 'description'
            document.head.appendChild(metaDesc)
        }
        metaDesc.setAttribute(
            'content',
            'A family of methodology-driven spatial indexes mapping real estate potential, civil protection priority, and solar energy suitability across Italy.'
        )

        const t = setTimeout(() => setHeroIn(true), 60)

        return () => {
            document.title = prevTitle
            if (metaDesc) {
                if (prevDesc) metaDesc.setAttribute('content', prevDesc)
                else metaDesc.remove()
            }
            clearTimeout(t)
        }
    }, [])

    // Smooth navigation with View Transitions if supported
    const handleExploreUrban = () => {
        if (!document.startViewTransition) {
            onSelectUrban()
            return
        }
        document.startViewTransition(() => {
            onSelectUrban()
        })
    }

    const scrollToWorkbench = (tabId) => {
        setActiveTab(tabId)
        if (workbenchRef.current) {
            workbenchRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
    }

    // Projects configuration
    const projects = {
        urban: {
            id: 'urban',
            title: 'UrbanProspect',
            subtitle: 'Real Estate & Urban Development',
            badge: 'Active & Interactive',
            desc: 'A satellite-powered screening tool identifying high-potential residential real estate investment zones based on soil sealing, canopy cover, and urban connectivity.',
            color: '#7bc47f', // Green
            glowColor: 'rgba(123,196,127,0.18)',
            iconPath: (
                <svg width="36" height="36" viewBox="0 0 32 32" fill="none">
                    <rect width="32" height="32" rx="6" fill="rgba(123,196,127,0.12)" />
                    <path d="M8 22 L16 10 L24 22" stroke="#7bc47f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M11 18 L16 10 L21 18" stroke="#7bc47f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="rgba(123,196,127,0.12)" />
                    <circle cx="16" cy="10" r="2.5" fill="#7bc47f" />
                </svg>
            ),
            indicators: [
                { name: 'Imperviousness Density (IMD)', key: 'imd', defaultWeight: 35, mockVal: 60, desc: 'Copernicus HRL soil sealing index. Lower soil sealing translates to higher natural lands available for development.' },
                { name: 'Tree Cover Density (TCD)', key: 'tcd', defaultWeight: 25, mockVal: 65, desc: 'Copernicus HRL tree canopy density. Surfaces neighborhood green coverage and environmental desirability.' },
                { name: 'Population Growth', key: 'pop', defaultWeight: 30, mockVal: 80, desc: 'ISTAT Demo resident population annual trajectory. Serves as a direct proxy for residential housing demand.' },
                { name: 'City Access', key: 'access', defaultWeight: 10, mockVal: 75, desc: 'OSRM routing driving time to the nearest Italian regional capital. Measures connectivity and economic tie strengths.' },
            ],
            formulaText: '0.35·IMD + 0.25·TCD + 0.30·Population + 0.10·Access'
        },
        risk: {
            id: 'risk',
            title: 'RiskWatch Italia',
            subtitle: 'Civil Protection Priority Index',
            badge: 'Methodology Active',
            desc: 'An analytical dashboard evaluating 1,050 municipalities in Central Italy (Lazio, Toscana, Umbria, Abruzzo) on resource allocation priority using a multi-hazard priority score.',
            color: '#e05645', // Red
            glowColor: 'rgba(224,86,69,0.18)',
            iconPath: (
                <svg width="36" height="36" viewBox="0 0 32 32" fill="none">
                    <rect width="32" height="32" rx="6" fill="rgba(224,86,69,0.12)" />
                    <path d="M16 6 L26 12 L26 20 C26 25 19 28 16 29 C13 28 6 25 6 20 L6 12 Z" stroke="#e05645" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12 17 L15 20 L21 14" stroke="#e05645" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            ),
            indicators: [
                { name: 'Seismic Score', key: 'seismic', defaultWeight: 25, mockVal: 70, desc: 'Historic regional earthquake frequency, local building age vulnerabilities, and peak ground acceleration (PGA).' },
                { name: 'Flood & Landslide Score', key: 'flood', defaultWeight: 30, mockVal: 55, desc: 'ISPRA hazard mapping combining flood return periods, hydrogeological vulnerability, and active landslide zones.' },
                { name: 'Wildfire Score', key: 'wildfire', defaultWeight: 15, mockVal: 30, desc: 'Climate-driven fire danger index (FDI), vegetation fuels, historical burn occurrences, and urban interface proximity.' },
                { name: 'Vulnerability Score', key: 'vulnerability', defaultWeight: 20, mockVal: 60, desc: 'Demographic vulnerability including index of elderly population ratio, social vulnerability index, and unoccupied buildings.' },
                { name: 'Infrastructure Risk Score', key: 'infrastructure', defaultWeight: 10, mockVal: 45, desc: 'Density of local transport networks, distance to emergency responder centers, and vital lifeline network vulnerability.' },
            ],
            formulaText: '0.25·Seismic + 0.30·Flood + 0.15·Wildfire + 0.20·Vulnerability + 0.10·Infrastructure'
        },
        solar: {
            id: 'solar',
            title: 'SolarProspect',
            subtitle: 'Photovoltaic Site Suitability',
            badge: 'Preview Specs Active',
            desc: 'A green energy scouting interface providing key infrastructure and suitability lists for solar developers, EPC contractors, and infrastructure funds in under 10 minutes.',
            color: '#ffd166', // Yellow
            glowColor: 'rgba(255,209,102,0.18)',
            iconPath: (
                <svg width="36" height="36" viewBox="0 0 32 32" fill="none">
                    <rect width="32" height="32" rx="6" fill="rgba(255,209,102,0.12)" />
                    <circle cx="16" cy="16" r="6" stroke="#ffd166" strokeWidth="2.5" />
                    <path d="M16 4 L16 7 M16 25 L16 28 M4 16 L7 16 M25 16 L28 16 M7.5 7.5 L9.6 9.6 M22.4 22.4 L24.5 24.5 M24.5 7.5 L22.4 9.6 M9.6 22.4 L7.5 24.5" stroke="#ffd166" strokeWidth="2" strokeLinecap="round" />
                </svg>
            ),
            indicators: [
                { name: 'Irradiance', key: 'irradiance', defaultWeight: 40, mockVal: 85, desc: 'Annual solar energy received per square meter (PVGIS SARAH-3 dataset), surfacing optimal sun-exposed areas.' },
                { name: 'Land Availability', key: 'land', defaultWeight: 25, mockVal: 70, desc: 'Share of non-impervious surface available for photovoltaic installations based on Copernicus HRL datasets.' },
                { name: 'Constraint Absence', key: 'constraint', defaultWeight: 20, mockVal: 90, desc: 'Absence of protected regions (Natura 2000 network), national parks, and active hydrogeological hazards (ISPRA).' },
                { name: 'Grid Proximity', key: 'grid', defaultWeight: 15, mockVal: 60, desc: 'Driving centroid distance to the nearest Italian high-voltage power transmission lines managed by Terna.' },
            ],
            formulaText: '0.40·Irradiance + 0.25·Land + 0.20·Constraints + 0.15·Grid'
        }
    }

    // Weight and value states for the workbench simulator
    const [weights, setWeights] = useState({
        urban: projects.urban.indicators.map(i => i.defaultWeight),
        risk: projects.risk.indicators.map(i => i.defaultWeight),
        solar: projects.solar.indicators.map(i => i.defaultWeight),
    })

    const [mockValues, setMockValues] = useState({
        urban: projects.urban.indicators.map(i => i.mockVal),
        risk: projects.risk.indicators.map(i => i.mockVal),
        solar: projects.solar.indicators.map(i => i.mockVal),
    })

    // Reset weights to default
    const resetWeights = (projKey) => {
        setWeights(prev => ({
            ...prev,
            [projKey]: projects[projKey].indicators.map(i => i.defaultWeight)
        }))
    }

    // Proportional weight update handler to ensure sum = 100%
    const handleWeightChange = (projKey, index, value) => {
        setWeights(prev => {
            const currentWeights = [...prev[projKey]]
            const oldValue = currentWeights[index]
            const diff = value - oldValue

            const otherSum = currentWeights.reduce((sum, w, idx) => idx === index ? sum : sum + w, 0)

            if (otherSum === 0) {
                const count = currentWeights.length - 1
                const val = Math.max(0, (100 - value) / count)
                currentWeights.forEach((w, idx) => {
                    if (idx !== index) currentWeights[idx] = val
                })
            } else {
                currentWeights.forEach((w, idx) => {
                    if (idx !== index) {
                        const proportion = w / otherSum
                        currentWeights[idx] = Math.max(0, w - diff * proportion)
                    }
                })
            }
            currentWeights[index] = value

            // Strict correction to force exactly 100
            const sumAfter = currentWeights.reduce((sum, w) => sum + w, 0)
            if (sumAfter !== 100) {
                const scale = 100 / sumAfter
                currentWeights.forEach((w, idx) => {
                    currentWeights[idx] = Math.round(w * scale * 10) / 10
                })
                const sumFinal = currentWeights.reduce((sum, w) => sum + w, 0)
                if (sumFinal !== 100) {
                    const err = 100 - sumFinal
                    currentWeights[index] = Math.round((currentWeights[index] + err) * 10) / 10
                }
            }

            return {
                ...prev,
                [projKey]: currentWeights
            }
        })
    }

    const handleValueChange = (projKey, index, value) => {
        setMockValues(prev => {
            const copy = [...prev[projKey]]
            copy[index] = value
            return {
                ...prev,
                [projKey]: copy
            }
        })
    }

    // Compute composite simulated score
    const computedScore = (() => {
        const w = weights[activeTab]
        const v = mockValues[activeTab]
        const rawScore = w.reduce((acc, weight, idx) => {
            let val = v[idx]
            if (activeTab === 'urban' && idx === 0) {
                val = 100 - val
            }
            return acc + (weight * val)
        }, 0) / 100
        return Math.round(rawScore * 10) / 10
    })()

    return (
        <div className="portal-container">
            <style>{`
                /* Portal styling tokens */
                .portal-container {
                    min-height: 100vh;
                    background: #090e0c;
                    color: #e8ede9;
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                    overflow-x: hidden;
                    position: relative;
                }

                /* Background grid and animation */
                .portal-grid-bg {
                    position: fixed;
                    inset: 0;
                    z-index: 0;
                    pointer-events: none;
                    background-image: 
                        linear-gradient(rgba(123, 196, 127, 0.03) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(123, 196, 127, 0.03) 1px, transparent 1px);
                    background-size: 56px 56px;
                    animation: portalGridDrift 28s linear infinite;
                }

                @keyframes portalGridDrift {
                    0% { transform: translate(0, 0); }
                    100% { transform: translate(56px, 56px); }
                }

                /* Floating glowing gradients */
                .portal-glow {
                    position: fixed;
                    width: 700px;
                    height: 700px;
                    border-radius: 50%;
                    pointer-events: none;
                    z-index: 0;
                    filter: blur(120px);
                    opacity: 0.6;
                    transition: background 1.2s ease, transform 1.2s ease;
                }

                .glow-top-left {
                    top: -15%;
                    left: -10%;
                    background: radial-gradient(circle, rgba(30, 107, 92, 0.12) 0%, transparent 70%);
                }

                .glow-bottom-right {
                    bottom: -20%;
                    right: -10%;
                    background: radial-gradient(circle, rgba(181, 137, 0, 0.08) 0%, transparent 70%);
                }

                .portal-content {
                    position: relative;
                    z-index: 1;
                    width: 100%;
                }

                /* Sticky Navbar */
                .portal-nav {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 24px 64px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                    position: sticky;
                    top: 0;
                    z-index: 100;
                    background: rgba(9, 14, 12, 0.85);
                    backdrop-filter: blur(16px);
                    WebkitBackdropFilter: blur(16px);
                    transition: all 0.5s ease;
                }

                .portal-logo {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .portal-logo-svg {
                    width: 30px;
                    height: 30px;
                    background: rgba(255, 255, 255, 0.04);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .portal-brandname {
                    font-size: 14px;
                    font-weight: 700;
                    letter-spacing: 0.18em;
                    text-transform: uppercase;
                    color: #e8ede9;
                }

                .portal-brandname span {
                    color: #7bc47f;
                }

                .portal-nav-links {
                    display: flex;
                    align-items: center;
                    gap: 32px;
                }

                .portal-nav-link {
                    font-size: 12px;
                    font-weight: 600;
                    letter-spacing: 0.05em;
                    text-transform: uppercase;
                    color: #7a8f7c;
                    cursor: pointer;
                    text-decoration: none;
                    transition: color 0.2s ease;
                }

                .portal-nav-link:hover {
                    color: #e8ede9;
                }

                /* Hero Section */
                .portal-hero {
                    padding: 100px 64px 80px;
                    max-width: 1100px;
                    margin: 0 auto;
                    text-align: center;
                }

                .portal-hero-tag {
                    font-size: 11px;
                    font-weight: 600;
                    letter-spacing: 0.3em;
                    text-transform: uppercase;
                    color: #7bc47f;
                    margin-bottom: 24px;
                    display: inline-block;
                }

                .portal-hero-title {
                    font-size: clamp(38px, 5.5vw, 68px);
                    font-weight: 300;
                    line-height: 1.08;
                    margin-bottom: 28px;
                    color: #f0f4f0;
                    font-style: italic;
                    letter-spacing: -0.01em;
                }

                .portal-hero-title span {
                    font-style: normal;
                    font-weight: 600;
                    background: linear-gradient(135deg, #7bc47f 10%, #ffd166 100%);
                    WebkitBackgroundClip: text;
                    WebkitTextFillColor: transparent;
                }

                .portal-hero-desc {
                    font-size: 17px;
                    line-height: 1.8;
                    color: #a8bfaa;
                    max-width: 680px;
                    margin: 0 auto 48px;
                }

                /* Project Cards Grid */
                .portal-cards-section {
                    padding: 0 64px 80px;
                    max-width: 1280px;
                    margin: 0 auto;
                }

                .portal-cards-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
                    gap: 32px;
                }

                /* Glowing interactive card */
                .project-card {
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid rgba(255, 255, 255, 0.07);
                    border-radius: 16px;
                    padding: 36px;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    position: relative;
                    overflow: hidden;
                    transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), 
                                border-color 0.4s ease, 
                                box-shadow 0.4s ease;
                }

                .project-card::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: radial-gradient(circle at 50% 0%, var(--card-glow-color, rgba(255,255,255,0.01)) 0%, transparent 65%);
                    opacity: 0;
                    transition: opacity 0.4s ease;
                    pointer-events: none;
                }

                .project-card:hover {
                    transform: translateY(-8px);
                    border-color: var(--card-theme-color);
                    box-shadow: 0 16px 40px var(--card-glow-shadow);
                }

                .project-card:hover::before {
                    opacity: 1;
                }

                .card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 24px;
                }

                .card-badge {
                    font-size: 10px;
                    font-weight: 700;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                    padding: 4px 10px;
                    border-radius: 20px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    color: var(--card-theme-color);
                    background: rgba(255, 255, 255, 0.02);
                }

                .card-title {
                    font-size: 24px;
                    font-weight: 700;
                    color: #f0f4f0;
                    margin-bottom: 8px;
                }

                .card-subtitle {
                    font-size: 12px;
                    font-weight: 500;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    color: #7a8f7c;
                    margin-bottom: 20px;
                }

                .card-desc {
                    font-size: 14px;
                    line-height: 1.7;
                    color: #a8bfaa;
                    margin-bottom: 32px;
                    flex-grow: 1;
                }

                .card-formula-preview {
                    border-top: 1px dashed rgba(255, 255, 255, 0.08);
                    padding-top: 20px;
                    margin-bottom: 32px;
                }

                .formula-preview-label {
                    font-size: 10px;
                    font-weight: 600;
                    letter-spacing: 0.1em;
                    text-transform: uppercase;
                    color: #556c59;
                    margin-bottom: 8px;
                }

                .formula-preview-expr {
                    font-size: 12px;
                    font-family: 'Courier New', Courier, monospace;
                    color: #e8ede9;
                    background: rgba(0, 0, 0, 0.2);
                    padding: 8px 12px;
                    border-radius: 6px;
                    border: 1px solid rgba(255, 255, 255, 0.04);
                    word-break: break-all;
                }

                .card-actions {
                    display: flex;
                    gap: 12px;
                }

                .btn {
                    padding: 12px 24px;
                    border-radius: 8px;
                    font-size: 12px;
                    font-weight: 700;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                    cursor: pointer;
                    font-family: inherit;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    transition: all 0.2s ease;
                    text-decoration: none;
                }

                .btn-primary {
                    background: var(--card-theme-color);
                    color: #090e0c;
                    border: none;
                    flex-grow: 1;
                }

                .btn-primary:hover {
                    opacity: 0.9;
                    transform: scale(1.02);
                }

                .btn-secondary {
                    background: transparent;
                    color: #e8ede9;
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    flex-grow: 1;
                }

                .btn-secondary:hover {
                    background: rgba(255, 255, 255, 0.04);
                    border-color: rgba(255, 255, 255, 0.3);
                }

                /* Interactive Workbench */
                .portal-workbench {
                    padding: 80px 64px 100px;
                    max-width: 1280px;
                    margin: 0 auto;
                    border-top: 1px solid rgba(255, 255, 255, 0.05);
                }

                .workbench-title-area {
                    text-align: center;
                    margin-bottom: 48px;
                }

                .workbench-tag {
                    font-size: 11px;
                    font-weight: 600;
                    letter-spacing: 0.25em;
                    text-transform: uppercase;
                    color: #7bc47f;
                    margin-bottom: 12px;
                }

                .workbench-title {
                    font-size: 36px;
                    font-weight: 400;
                    font-style: italic;
                    color: #f0f4f0;
                }

                /* Workbench Tabs */
                .workbench-tabs {
                    display: flex;
                    justify-content: center;
                    gap: 16px;
                    margin-bottom: 40px;
                }

                .workbench-tab {
                    padding: 12px 28px;
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid rgba(255, 255, 255, 0.06);
                    color: #7a8f7c;
                    border-radius: 30px;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .workbench-tab:hover {
                    color: #e8ede9;
                    background: rgba(255, 255, 255, 0.05);
                }

                .workbench-tab.active-urban {
                    border-color: #7bc47f;
                    color: #7bc47f;
                    background: rgba(123, 196, 127, 0.06);
                    box-shadow: 0 0 15px rgba(123, 196, 127, 0.1);
                }

                .workbench-tab.active-risk {
                    border-color: #e05645;
                    color: #e05645;
                    background: rgba(224, 86, 69, 0.06);
                    box-shadow: 0 0 15px rgba(224, 86, 69, 0.1);
                }

                .workbench-tab.active-solar {
                    border-color: #ffd166;
                    color: #ffd166;
                    background: rgba(255, 209, 102, 0.06);
                    box-shadow: 0 0 15px rgba(255, 209, 102, 0.1);
                }

                /* Workbench Workspace Layout */
                .workbench-grid {
                    display: grid;
                    grid-template-columns: 1.2fr 0.8fr;
                    gap: 48px;
                    background: rgba(255, 255, 255, 0.01);
                    border: 1px solid rgba(255, 255, 255, 0.04);
                    border-radius: 20px;
                    padding: 40px;
                    backdrop-filter: blur(12px);
                    WebkitBackdropFilter: blur(12px);
                }

                @media (max-width: 900px) {
                    .workbench-grid {
                        grid-template-columns: 1fr;
                        padding: 24px;
                    }
                    .portal-nav {
                        padding: 16px 24px;
                    }
                    .portal-hero, .portal-cards-section, .portal-workbench {
                        padding-left: 24px;
                        padding-right: 24px;
                    }
                }

                /* Slider styling */
                .slider-group {
                    margin-bottom: 28px;
                    padding-bottom: 20px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
                }

                .slider-group:last-child {
                    border-bottom: none;
                    margin-bottom: 0;
                    padding-bottom: 0;
                }

                .slider-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: baseline;
                    margin-bottom: 10px;
                }

                .slider-label {
                    font-size: 14px;
                    font-weight: 600;
                    color: #e8ede9;
                }

                .slider-values-display {
                    display: flex;
                    gap: 12px;
                    font-size: 13px;
                }

                .weight-display {
                    color: var(--accent-theme-color);
                    font-weight: 700;
                }

                .val-display {
                    color: #7a8f7c;
                }

                .slider-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                    align-items: center;
                }

                @media (max-width: 600px) {
                    .slider-row {
                        grid-template-columns: 1fr;
                        gap: 12px;
                    }
                }

                .slider-col {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .slider-col-label {
                    font-size: 10px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: #4b5e4d;
                    min-width: 50px;
                }

                .range-input {
                    -webkit-appearance: none;
                    appearance: none;
                    flex: 1;
                    height: 5px;
                    border-radius: 3px;
                    background: rgba(255, 255, 255, 0.08);
                    outline: none;
                }

                .range-input::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 14px;
                    height: 14px;
                    border-radius: 50%;
                    background: var(--accent-theme-color);
                    cursor: pointer;
                    box-shadow: 0 0 10px var(--accent-theme-color-glow);
                    transition: transform 0.1s ease;
                }

                .range-input::-webkit-slider-thumb:hover {
                    transform: scale(1.2);
                }

                .range-input::-moz-range-thumb {
                    width: 14px;
                    height: 14px;
                    border-radius: 50%;
                    background: var(--accent-theme-color);
                    cursor: pointer;
                    box-shadow: 0 0 10px var(--accent-theme-color-glow);
                    transition: transform 0.1s ease;
                    border: none;
                }

                .range-input::-moz-range-thumb:hover {
                    transform: scale(1.2);
                }

                .indicator-desc {
                    font-size: 12px;
                    line-height: 1.6;
                    color: #7a8f7c;
                    margin-top: 6px;
                }

                /* Simulated Score Card Display */
                .simulation-output-panel {
                    background: rgba(0, 0, 0, 0.2);
                    border: 1px solid rgba(255, 255, 255, 0.04);
                    border-radius: 12px;
                    padding: 32px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    position: sticky;
                    top: 100px;
                    height: fit-content;
                }

                .score-radial-wrap {
                    position: relative;
                    width: 180px;
                    height: 180px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 24px;
                }

                /* Circular Score Progress svg glow style */
                .score-glow-ring {
                    position: absolute;
                    inset: 0;
                    border-radius: 50%;
                    border: 2px solid rgba(255, 255, 255, 0.02);
                    box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.6);
                }

                .score-radial-num {
                    font-size: 54px;
                    font-weight: 800;
                    color: var(--accent-theme-color);
                    line-height: 1;
                    font-variant-numeric: tabular-nums;
                    text-shadow: 0 0 25px var(--accent-theme-color-glow);
                }

                .score-radial-label {
                    font-size: 11px;
                    font-weight: 700;
                    letter-spacing: 0.1em;
                    text-transform: uppercase;
                    color: #7a8f7c;
                    margin-top: 4px;
                }

                .score-detail-box {
                    width: 100%;
                    border-top: 1px solid rgba(255, 255, 255, 0.06);
                    padding-top: 24px;
                }

                .score-detail-title {
                    font-size: 13px;
                    font-weight: 600;
                    color: #e8ede9;
                    margin-bottom: 8px;
                }

                .score-detail-formula {
                    font-size: 11px;
                    font-family: 'Courier New', Courier, monospace;
                    color: #7a8f7c;
                    background: rgba(255, 255, 255, 0.02);
                    padding: 10px;
                    border-radius: 6px;
                    border: 1px solid rgba(255, 255, 255, 0.04);
                    word-break: break-all;
                    line-height: 1.4;
                    margin-bottom: 16px;
                }

                .score-desc-para {
                    font-size: 12px;
                    line-height: 1.6;
                    color: #7a8f7c;
                    margin: 0;
                }

                .reset-btn {
                    margin-top: 20px;
                    background: none;
                    border: 1px dashed var(--accent-theme-color);
                    color: var(--accent-theme-color);
                    padding: 8px 16px;
                    border-radius: 6px;
                    font-size: 11px;
                    font-weight: 600;
                    letter-spacing: 0.05em;
                    text-transform: uppercase;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .reset-btn:hover {
                    background: rgba(255, 255, 255, 0.02);
                    border-style: solid;
                }

                /* Footer */
                .portal-footer {
                    padding: 40px 64px;
                    border-top: 1px solid rgba(255, 255, 255, 0.05);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    color: #4a5e4c;
                    font-size: 12px;
                    position: relative;
                    z-index: 1;
                }

                /* Scientific Foundations styling */
                .portal-methodology-section {
                    padding: 80px 64px;
                    max-width: 1280px;
                    margin: 0 auto;
                    border-top: 1px solid rgba(255, 255, 255, 0.05);
                }

                .methodology-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 32px;
                    margin-top: 48px;
                }

                @media (max-width: 900px) {
                    .methodology-grid {
                        grid-template-columns: 1fr;
                        gap: 24px;
                    }
                }

                .methodology-pillar-card {
                    background: rgba(255, 255, 255, 0.01);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 12px;
                    padding: 32px;
                    transition: border-color 0.3s ease, box-shadow 0.3s ease;
                }

                .methodology-pillar-card:hover {
                    border-color: rgba(123, 196, 127, 0.2);
                    box-shadow: 0 8px 30px rgba(123, 196, 127, 0.04);
                }

                .methodology-pillar-icon {
                    margin-bottom: 20px;
                    display: inline-flex;
                }

                .methodology-pillar-title {
                    font-size: 18px;
                    font-weight: 600;
                    color: #f0f4f0;
                    margin-bottom: 12px;
                }

                .methodology-pillar-desc {
                    font-size: 13.5px;
                    line-height: 1.7;
                    color: #7a8f7c;
                }

                /* Responsive Pipeline Stepper Styling */
                .pipeline-container {
                    display: flex;
                    justify-content: space-between;
                    align-items: stretch;
                    gap: 16px;
                    margin-top: 48px;
                }

                .pipeline-step {
                    flex: 1;
                    background: rgba(255, 255, 255, 0.01);
                    border: 1px solid rgba(255, 255, 255, 0.04);
                    border-radius: 12px;
                    padding: 28px 24px;
                    transition: border-color 0.3s ease, box-shadow 0.3s ease;
                    display: flex;
                    flex-direction: column;
                }

                .pipeline-step:hover {
                    border-color: rgba(123, 196, 127, 0.2);
                    box-shadow: 0 8px 30px rgba(123, 196, 127, 0.05);
                }

                .pipeline-number {
                    font-size: 32px;
                    font-weight: 800;
                    color: rgba(255, 255, 255, 0.02);
                    margin-bottom: 12px;
                    line-height: 1;
                    font-style: italic;
                    letter-spacing: -0.05em;
                    -webkit-text-stroke: 1px rgba(123, 196, 127, 0.25);
                }

                .pipeline-title {
                    font-size: 14px;
                    font-weight: 700;
                    letter-spacing: 0.1em;
                    text-transform: uppercase;
                    color: #e8ede9;
                    margin-bottom: 8px;
                }

                .pipeline-desc {
                    font-size: 12.5px;
                    line-height: 1.6;
                    color: #7a8f7c;
                }

                .pipeline-arrow {
                    align-self: center;
                    color: rgba(123, 196, 127, 0.3);
                    font-size: 24px;
                    font-weight: 300;
                    user-select: none;
                }

                @media (max-width: 900px) {
                    .pipeline-container {
                        flex-direction: column;
                        gap: 20px;
                    }
                    .pipeline-arrow {
                        transform: rotate(90deg);
                        margin: 4px 0;
                    }
                }

                @media (max-width: 700px) {
                    .portal-footer {
                        flex-direction: column;
                        gap: 16px;
                        text-align: center;
                        padding: 30px 24px;
                    }
                }
            `}</style>

            {/* Background elements */}
            <div className="portal-grid-bg" />
            <div className="portal-glow glow-top-left" />
            <div className="portal-glow glow-bottom-right" />

            <div className="portal-content">
                {/* Navbar */}
                <nav className="portal-nav">
                    <div className="portal-logo">
                        <div className="portal-logo-svg">
                            <svg width="18" height="18" viewBox="0 0 32 32" fill="none">
                                <circle cx="16" cy="16" r="12" stroke="#7bc47f" strokeWidth="2.5" />
                                <circle cx="16" cy="16" r="6" stroke="#ffd166" strokeWidth="2" />
                                <path d="M16 10 L16 22 M10 16 L22 16" stroke="#e05645" strokeWidth="2" />
                            </svg>
                        </div>
                        <span className="portal-brandname">
                            Prospect<span>Suite</span>
                        </span>
                    </div>
                    <div className="portal-nav-links">
                        <a href="#projects" className="portal-nav-link">Projects</a>
                        <a href="#methodology" className="portal-nav-link">Methodology</a>
                        <a href="#workbench" className="portal-nav-link">Simulator</a>
                    </div>
                </nav>

                {/* Hero */}
                <section className="portal-hero">
                    <span 
                        className="portal-hero-tag"
                        style={{
                            opacity: heroIn ? 1 : 0,
                            transform: heroIn ? 'translateY(0)' : 'translateY(16px)',
                            transition: 'opacity 0.6s ease 0.1s, transform 0.6s ease 0.1s',
                        }}
                    >
                        Decision-Support Territorial Intelligence
                    </span>
                    <h1 
                        className="portal-hero-title"
                        style={{
                            opacity: heroIn ? 1 : 0,
                            transform: heroIn ? 'translateY(0)' : 'translateY(20px)',
                            transition: 'opacity 0.7s ease 0.2s, transform 0.7s ease 0.2s',
                        }}
                    >
                        Spatial models mapping <span>investment, risk & energy</span> potential
                    </h1>
                    <p 
                        className="portal-hero-desc"
                        style={{
                            opacity: heroIn ? 1 : 0,
                            transform: heroIn ? 'translateY(0)' : 'translateY(20px)',
                            transition: 'opacity 0.7s ease 0.3s, transform 0.7s ease 0.3s',
                        }}
                    >
                        A methodology-driven suite evaluating Italian municipalities through reproducible
                        data science, satellite observations, and Multi-Criteria Decision Analysis (MCDA).
                    </p>
                </section>

                {/* Project Cards Section */}
                <section id="projects" className="portal-cards-section">
                    <div className="portal-cards-grid">
                        
                        {/* UrbanProspect Card */}
                        <div 
                            className="project-card"
                            style={{
                                '--card-theme-color': projects.urban.color,
                                '--card-glow-color': projects.urban.glowColor,
                                '--card-glow-shadow': 'rgba(123, 196, 127, 0.12)',
                            }}
                        >
                            <div>
                                <div className="card-header">
                                    <div className="card-icon">{projects.urban.iconPath}</div>
                                    <span className="card-badge">{projects.urban.badge}</span>
                                </div>
                                <h3 className="card-title">{projects.urban.title}</h3>
                                <div className="card-subtitle">{projects.urban.subtitle}</div>
                                <p className="card-desc">{projects.urban.desc}</p>
                                <div className="card-formula-preview">
                                    <div className="formula-preview-label">Base Formula (MCDA)</div>
                                    <div className="formula-preview-expr">{projects.urban.formulaText}</div>
                                </div>
                            </div>
                            <div className="card-actions">
                                <button onClick={handleExploreUrban} className="btn btn-primary">
                                    Open Project →
                                </button>
                                <button onClick={() => scrollToWorkbench('urban')} className="btn btn-secondary">
                                    Simulator
                                </button>
                            </div>
                        </div>

                        {/* RiskWatch Card */}
                        <div 
                            className="project-card"
                            style={{
                                '--card-theme-color': projects.risk.color,
                                '--card-glow-color': projects.risk.glowColor,
                                '--card-glow-shadow': 'rgba(224, 86, 69, 0.12)',
                            }}
                        >
                            <div>
                                <div className="card-header">
                                    <div className="card-icon">{projects.risk.iconPath}</div>
                                    <span className="card-badge">{projects.risk.badge}</span>
                                </div>
                                <h3 className="card-title">{projects.risk.title}</h3>
                                <div className="card-subtitle">{projects.risk.subtitle}</div>
                                <p className="card-desc">{projects.risk.desc}</p>
                                <div className="card-formula-preview">
                                    <div className="formula-preview-label">Base Formula (MCDA)</div>
                                    <div className="formula-preview-expr">{projects.risk.formulaText}</div>
                                </div>
                            </div>
                            <div className="card-actions">
                                <a href="https://risk.dotlink.ai" className="btn btn-primary">
                                    Open Project →
                                </a>
                                <button onClick={() => scrollToWorkbench('risk')} className="btn btn-secondary">
                                    Simulator
                                </button>
                            </div>
                        </div>

                        {/* SolarProspect Card */}
                        <div 
                            className="project-card"
                            style={{
                                '--card-theme-color': projects.solar.color,
                                '--card-glow-color': projects.solar.glowColor,
                                '--card-glow-shadow': 'rgba(255, 209, 102, 0.12)',
                            }}
                        >
                            <div>
                                <div className="card-header">
                                    <div className="card-icon">{projects.solar.iconPath}</div>
                                    <span className="card-badge">{projects.solar.badge}</span>
                                </div>
                                <h3 className="card-title">{projects.solar.title}</h3>
                                <div className="card-subtitle">{projects.solar.subtitle}</div>
                                <p className="card-desc">{projects.solar.desc}</p>
                                <div className="card-formula-preview">
                                    <div className="formula-preview-label">Base Formula (MCDA)</div>
                                    <div className="formula-preview-expr">{projects.solar.formulaText}</div>
                                </div>
                            </div>
                            <div className="card-actions">
                                <a href="https://solar.dotlink.ai" className="btn btn-primary">
                                    Open Project →
                                </a>
                                <button onClick={() => scrollToWorkbench('solar')} className="btn btn-secondary">
                                    Simulator
                                </button>
                            </div>
                        </div>

                    </div>
                </section>

                {/* Scientific Foundations Section */}
                <section id="methodology" className="portal-methodology-section">
                    <div className="workbench-title-area">
                        <span className="workbench-tag">Scientific Foundations</span>
                        <h2 className="workbench-title">Unified Spatial Methodology</h2>
                        <p style={{
                            fontSize: '15px',
                            lineHeight: '1.75',
                            color: '#a8bfaa',
                            maxWidth: '760px',
                            margin: '16px auto 0',
                            fontFamily: "'Inter', sans-serif"
                        }}>
                            The Prospect Suite models territorial potential by harmonizing heterogeneous environmental, 
                            demographic, and infrastructure datasets into normalized decision matrices.
                        </p>
                    </div>

                    {/* Stepper Pipeline */}
                    <div className="pipeline-container">
                        <div className="pipeline-step">
                            <div className="pipeline-number">01</div>
                            <h4 className="pipeline-title">Ingest</h4>
                            <p className="pipeline-desc">
                                Fetch Copernicus satellite grids, ISTAT demographic timelines, routing graphs, and ISPRA/Natura 2000 hazard data.
                            </p>
                        </div>
                        <div className="pipeline-arrow">→</div>
                        <div className="pipeline-step">
                            <div className="pipeline-number">02</div>
                            <h4 className="pipeline-title">Harmonize</h4>
                            <p className="pipeline-desc">
                                Reproject spatial vectors to a unified coordinate grid and map shapes to administrative centroids.
                            </p>
                        </div>
                        <div className="pipeline-arrow">→</div>
                        <div className="pipeline-step">
                            <div className="pipeline-number">03</div>
                            <h4 className="pipeline-title">Normalize</h4>
                            <p className="pipeline-desc">
                                Scale raw units (such as percentages, minutes, or levels) to a uniform 0 – 100 range via Min-Max calculations.
                            </p>
                        </div>
                        <div className="pipeline-arrow">→</div>
                        <div className="pipeline-step">
                            <div className="pipeline-number">04</div>
                            <h4 className="pipeline-title">Model (MCDA)</h4>
                            <p className="pipeline-desc">
                                Combine parameters linearly using weights to output dynamic, overall prioritization scores.
                            </p>
                        </div>
                    </div>

                    {/* Three Pillars */}
                    <div className="methodology-grid">
                        
                        <div className="methodology-pillar-card">
                            <div className="methodology-pillar-icon">
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7bc47f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" />
                                    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                                    <path d="M2 12h20" />
                                </svg>
                            </div>
                            <h3 className="methodology-pillar-title">Satellite Earth Observation</h3>
                            <p className="methodology-pillar-desc">
                                We leverage Copernicus High Resolution Layers (HRL) compiled at 10-meter grid resolution. 
                                By processing multi-spectral satellite imagery, we model vegetative canopy (Tree Cover Density) 
                                and impervious soil sealing indices (Imperviousness Density) to map environmental parameters.
                            </p>
                        </div>

                        <div className="methodology-pillar-card">
                            <div className="methodology-pillar-icon">
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ffd166" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                                </svg>
                            </div>
                            <h3 className="methodology-pillar-title">Heterogeneous Data Fusion</h3>
                            <p className="methodology-pillar-desc">
                                Raw geographic tables, driving distance time graphs (OSRM routing), demographic census timelines (ISTAT Demography), 
                                high-voltage transmission lines (Terna), and ecological boundaries (Natura 2000 + ISPRA) are parsed, cleaned, 
                                and joined using WGS84 coordinate reference projections.
                            </p>
                        </div>

                        <div className="methodology-pillar-card">
                            <div className="methodology-pillar-icon">
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#e05645" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="20" x2="18" y2="10" />
                                    <line x1="12" y1="20" x2="12" y2="4" />
                                    <line x1="6" y1="20" x2="6" y2="14" />
                                </svg>
                            </div>
                            <h3 className="methodology-pillar-title">Decision Analysis (MCDA)</h3>
                            <p className="methodology-pillar-desc">
                                Different units of measure (e.g. percentages, drive-time minutes, risk levels) are standardised to a uniform <code>0 - 100</code> priority scale using Min-Max normalisation. A weighted linear model then combines these indicators dynamically based on configurable coefficient parameters.
                            </p>
                        </div>

                    </div>
                </section>

                {/* Workbench Section */}
                <section id="workbench" ref={workbenchRef} className="portal-workbench">
                    <div className="workbench-title-area">
                        <span className="workbench-tag">Interactive Simulation</span>
                        <h2 className="workbench-title">Methodology Workbench</h2>
                    </div>

                    {/* Tabs */}
                    <div className="workbench-tabs">
                        <button 
                            className={`workbench-tab ${activeTab === 'urban' ? 'active-urban' : ''}`}
                            onClick={() => setActiveTab('urban')}
                        >
                            UrbanProspect
                        </button>
                        <button 
                            className={`workbench-tab ${activeTab === 'risk' ? 'active-risk' : ''}`}
                            onClick={() => setActiveTab('risk')}
                        >
                            RiskWatch Italia
                        </button>
                        <button 
                            className={`workbench-tab ${activeTab === 'solar' ? 'active-solar' : ''}`}
                            onClick={() => setActiveTab('solar')}
                        >
                            SolarProspect
                        </button>
                    </div>

                    {/* Workbench Workspace */}
                    <div 
                        className="workbench-grid"
                        style={{
                            '--accent-theme-color': projects[activeTab].color,
                            '--accent-theme-color-glow': projects[activeTab].glowColor,
                        }}
                    >
                        {/* Sliders Area (Left) */}
                        <div className="sliders-container">
                            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '24px', color: '#f0f4f0' }}>
                                Parameter Configuration
                            </h3>
                            <div>
                                {projects[activeTab].indicators.map((indicator, idx) => {
                                    const wVal = weights[activeTab][idx]
                                    const mVal = mockValues[activeTab][idx]
                                    return (
                                        <div key={indicator.key} className="slider-group">
                                            <div className="slider-header">
                                                <span className="slider-label">{indicator.name}</span>
                                                <div className="slider-values-display">
                                                    <span className="weight-display">Weight: {Math.round(wVal)}%</span>
                                                    <span className="val-display">
                                                        Value: {mVal}/100{activeTab === 'urban' && idx === 0 && ` (Contribution: ${100 - mVal})`}
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            <div className="slider-row">
                                                {/* Weight Slider */}
                                                <div className="slider-col">
                                                    <span className="slider-col-label">Weight</span>
                                                    <input 
                                                        type="range"
                                                        min="0"
                                                        max="100"
                                                        value={Math.round(wVal)}
                                                        onChange={(e) => handleWeightChange(activeTab, idx, Number(e.target.value))}
                                                        className="range-input"
                                                    />
                                                </div>
                                                {/* Simulated Value Slider */}
                                                <div className="slider-col">
                                                    <span className="slider-col-label">Value</span>
                                                    <input 
                                                        type="range"
                                                        min="0"
                                                        max="100"
                                                        value={mVal}
                                                        onChange={(e) => handleValueChange(activeTab, idx, Number(e.target.value))}
                                                        className="range-input"
                                                    />
                                                </div>
                                            </div>
                                            
                                            <p className="indicator-desc">{indicator.desc}</p>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Score Display (Right) */}
                        <div className="simulation-output-panel">
                            <div className="score-radial-wrap">
                                <div className="score-glow-ring" />
                                <div style={{ zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <span className="score-radial-num">{computedScore}</span>
                                    <span className="score-radial-label">Priority Score</span>
                                </div>
                            </div>
                            
                            <div className="score-detail-box">
                                <h4 className="score-detail-title">Simulated Computation</h4>
                                <div className="score-detail-formula">
                                    Score = {projects[activeTab].indicators.map((ind, idx) => {
                                        const weightCoeff = (Math.round(weights[activeTab][idx]) / 100).toFixed(2)
                                        const valueParam = mockValues[activeTab][idx]
                                        if (activeTab === 'urban' && idx === 0) {
                                            return `(${weightCoeff} × (100 - ${valueParam}))`
                                        }
                                        return `(${weightCoeff} × ${valueParam})`
                                    }).join(' + ')}
                                </div>
                                <p className="score-desc-para">
                                    Adjust parameter weights and simulated values on the left to see how the overall decision matrix calculations update the composite score index.
                                </p>
                                <button onClick={() => resetWeights(activeTab)} className="reset-btn">
                                    Reset Default Weights
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="portal-footer">
                    <div>Prospect Suite · Scientific Spatial Indicators Suite</div>
                    <div>Designed with Copernicus, ISTAT, ISPRA & PVGIS open datasets.</div>
                </footer>
            </div>
        </div>
    )
}
