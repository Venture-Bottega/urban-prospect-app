import { useState, useEffect, useRef } from 'react'
import { useUser, UserButton } from '@clerk/react'


/* ── Scroll-reveal hook ── */
function useReveal() {
    const ref = useRef(null)
    const [visible, setVisible] = useState(false)
    useEffect(() => {
        const el = ref.current
        if (!el) return
        const obs = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect() } },
            { threshold: 0.12 }
        )
        obs.observe(el)
        return () => obs.disconnect()
    }, [])
    return [ref, visible]
}

function RevealSection({ children, delay = 0, className = '' }) {
    const [ref, visible] = useReveal()
    return (
        <div
            ref={ref}
            className={className}
            style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(32px)',
                transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
            }}
        >
            {children}
        </div>
    )
}

export default function LandingPage({ onEnter, onSignIn, onBack }) {
    const { isSignedIn, isLoaded } = useUser()
    const [form, setForm] = useState({ name: '', email: '', organisation: '', message: '' })
    const [status, setStatus] = useState(null)
    const [heroIn, setHeroIn] = useState(false)

    useEffect(() => {
        const t = setTimeout(() => setHeroIn(true), 60)
        return () => clearTimeout(t)
    }, [])

    function handleChange(e) {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const SHEETS_URL = 'https://script.google.com/macros/s/AKfycbwzlX-XyNnNZC3QqrlloOj4VTnjvLtMXJOEC3p5rgjkktNly0xOwj2ashNtBBFS7jiU/exec'

    async function handleSubmit() {
        if (!form.name || !form.email) { setStatus('error'); return }
        setStatus('sending')
        try {
            await fetch(SHEETS_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ timestamp: new Date().toISOString(), ...form }),
            })
            setForm({ name: '', email: '', organisation: '', message: '' })
            setStatus('sent')
        } catch { setStatus('error') }
    }

    const inputStyle = {
        width: '100%',
        padding: '12px 16px',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '6px',
        color: '#e8ede9',
        fontSize: '14px',
        boxSizing: 'border-box',
        outline: 'none',
        fontFamily: 'inherit',
        transition: 'border-color 0.2s ease',
    }
    const labelStyle = {
        fontSize: '11px',
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        color: '#7a8f7c',
        marginBottom: '8px',
        display: 'block',
    }

    return (
        <div style={{ minHeight: '100vh', background: '#0d1a12', color: '#e8ede9', fontFamily: "'Georgia', 'Times New Roman', serif", overflowX: 'hidden', position: 'relative' }}>

            {/* ── Animated grid background ── */}
            <div style={{
                position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
                backgroundImage: `linear-gradient(rgba(123,196,127,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(123,196,127,0.04) 1px, transparent 1px)`,
                backgroundSize: '48px 48px',
                animation: 'landingGridDrift 24s linear infinite',
            }} />

            {/* ── Radial glow top-left ── */}
            <div style={{
                position: 'fixed', top: '-10%', left: '-5%', width: '600px', height: '600px',
                background: 'radial-gradient(circle, rgba(123,196,127,0.07) 0%, transparent 65%)',
                pointerEvents: 'none', zIndex: 0,
            }} />

            <div style={{ position: 'relative', zIndex: 1 }}>

                {/* ── Nav ── */}
                <nav style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '24px 48px',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                    position: 'sticky', top: 0, zIndex: 100,
                    background: 'rgba(13,26,18,0.85)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    opacity: heroIn ? 1 : 0,
                    transform: heroIn ? 'translateY(0)' : 'translateY(-12px)',
                    transition: 'opacity 0.5s ease, transform 0.5s ease',
                }}>
                    <div 
                        onClick={onBack}
                        style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
                        title="Back to Suite Portal"
                    >
                        <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                            <rect width="32" height="32" rx="6" fill="rgba(123,196,127,0.12)" />
                            <path d="M8 22 L16 10 L24 22" stroke="#7bc47f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M11 18 L16 10 L21 18" stroke="#7bc47f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="rgba(123,196,127,0.12)" />
                            <circle cx="16" cy="10" r="2" fill="#7bc47f" />
                        </svg>
                        <span style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#7bc47f', fontFamily: "'Inter', sans-serif" }}>
                            Urban Prospect
                        </span>
                        <span style={{ 
                            fontSize: '11px', color: '#7a8f7c', fontFamily: "'Inter', sans-serif", 
                            marginLeft: '8px', paddingLeft: '8px', borderLeft: '1px solid rgba(255,255,255,0.1)',
                            letterSpacing: '0.05em' 
                        }}>
                            ← Sibling Portal
                        </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        {isLoaded && !isSignedIn && (
                            <button onClick={onSignIn} style={{
                                background: 'transparent', color: '#e8ede9', border: '1px solid rgba(255,255,255,0.15)',
                                padding: '10px 20px', borderRadius: '6px', fontWeight: 600,
                                fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase',
                                cursor: 'pointer', fontFamily: "'Inter', sans-serif",
                                transition: 'background 0.2s ease, border-color 0.2s ease',
                            }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)' }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)' }}
                            >
                                Sign In
                            </button>
                        )}
                        {isLoaded && isSignedIn && (
                            <UserButton afterSignOutUrl="/" />
                        )}
                        <button onClick={onEnter} style={{
                            background: '#7bc47f', color: '#0d1a12', border: 'none',
                            padding: '10px 24px', borderRadius: '6px', fontWeight: 700,
                            fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase',
                            cursor: 'pointer', fontFamily: "'Inter', sans-serif",
                            transition: 'background 0.2s ease, transform 0.15s ease',
                        }}
                            onMouseEnter={e => e.currentTarget.style.background = '#6ab46e'}
                            onMouseLeave={e => e.currentTarget.style.background = '#7bc47f'}
                        >
                            Open Map →
                        </button>
                    </div>
                </nav>

                {/* ── Hero ── */}
                <section style={{ padding: '110px 48px 90px', maxWidth: '960px' }}>
                    <div style={{
                        fontSize: '11px', letterSpacing: '0.28em', textTransform: 'uppercase',
                        color: '#7bc47f', marginBottom: '28px', fontFamily: "'Inter', sans-serif",
                        opacity: heroIn ? 1 : 0, transform: heroIn ? 'translateY(0)' : 'translateY(16px)',
                        transition: 'opacity 0.6s ease 0.1s, transform 0.6s ease 0.1s',
                    }}>
                        Territorial Intelligence for Real Estate
                    </div>
                    <h1 style={{
                        fontSize: 'clamp(44px, 6vw, 82px)', fontWeight: 400, lineHeight: 1.04,
                        margin: '0 0 32px', color: '#f0f4f0', fontStyle: 'italic',
                        opacity: heroIn ? 1 : 0, transform: heroIn ? 'translateY(0)' : 'translateY(20px)',
                        transition: 'opacity 0.7s ease 0.2s, transform 0.7s ease 0.2s',
                    }}>
                        Where should you<br />invest next?
                    </h1>
                    <p style={{
                        fontSize: '18px', lineHeight: 1.75, color: '#a8bfaa',
                        maxWidth: '560px', margin: '0 0 52px',
                        fontFamily: "'Inter', sans-serif", fontStyle: 'normal',
                        opacity: heroIn ? 1 : 0, transform: heroIn ? 'translateY(0)' : 'translateY(20px)',
                        transition: 'opacity 0.7s ease 0.3s, transform 0.7s ease 0.3s',
                    }}>
                        Urban Prospect is a satellite-powered screening tool that identifies residential
                        real estate opportunity across Central Italy — before the market does.
                    </p>
                    <div style={{
                        display: 'flex', gap: '16px', flexWrap: 'wrap',
                        opacity: heroIn ? 1 : 0, transform: heroIn ? 'translateY(0)' : 'translateY(20px)',
                        transition: 'opacity 0.7s ease 0.4s, transform 0.7s ease 0.4s',
                    }}>
                        <button onClick={onEnter} style={{
                            background: 'transparent', color: '#7bc47f',
                            border: '1.5px solid #7bc47f', padding: '14px 36px',
                            borderRadius: '6px', fontSize: '13px', fontWeight: 600,
                            letterSpacing: '0.1em', textTransform: 'uppercase',
                            cursor: 'pointer', fontFamily: "'Inter', sans-serif",
                            transition: 'background 0.2s ease, color 0.2s ease',
                        }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(123,196,127,0.1)' }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                        >
                            Explore the Map
                        </button>
                        <a href="#contact" style={{
                            background: 'transparent', color: '#7a8f7c',
                            border: '1.5px solid rgba(255,255,255,0.1)', padding: '14px 36px',
                            borderRadius: '6px', fontSize: '13px', fontWeight: 600,
                            letterSpacing: '0.1em', textTransform: 'uppercase',
                            cursor: 'pointer', fontFamily: "'Inter', sans-serif",
                            textDecoration: 'none', display: 'inline-flex', alignItems: 'center',
                            transition: 'border-color 0.2s ease, color 0.2s ease',
                        }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; e.currentTarget.style.color = '#e8ede9' }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#7a8f7c' }}
                        >
                            Request Access
                        </a>
                    </div>
                </section>

                {/* ── Stats strip ── */}
                <RevealSection>
                    <div style={{
                        margin: '0 48px 80px',
                        background: 'rgba(123,196,127,0.04)',
                        border: '1px solid rgba(123,196,127,0.12)',
                        borderRadius: '12px',
                        padding: '36px 48px',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        gap: '32px',
                    }}>
                        {[
                            { num: '1,048', label: 'Municipalities screened' },
                            { num: '4', label: 'Central Italy regions' },
                            { num: '10 m', label: 'Satellite resolution' },
                            { num: '5', label: 'Independent data sources' },
                        ].map(({ num, label }) => (
                            <div key={label} style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '32px', fontWeight: 700, color: '#7bc47f', fontFamily: "'Inter', sans-serif", letterSpacing: '-0.02em' }}>{num}</div>
                                <div style={{ fontSize: '11px', color: '#4a5e4c', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '6px', fontFamily: "'Inter', sans-serif" }}>{label}</div>
                            </div>
                        ))}
                    </div>
                </RevealSection>

                <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '0 48px' }} />

                {/* ── Score section ── */}
                <section style={{ padding: '90px 48px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', maxWidth: '1140px' }}>
                    <RevealSection>
                        <div style={{ fontSize: '11px', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#7bc47f', marginBottom: '20px', fontFamily: "'Inter', sans-serif" }}>The Score</div>
                        <h2 style={{ fontSize: '34px', fontWeight: 400, margin: '0 0 24px', lineHeight: 1.2, fontStyle: 'italic' }}>
                            What is the Prospect Score?
                        </h2>
                        <p style={{ fontSize: '15px', lineHeight: 1.85, color: '#a8bfaa', margin: '0 0 20px', fontFamily: "'Inter', sans-serif", fontStyle: 'normal' }}>
                            A composite 0–100 index computed from satellite and census signals,
                            designed to surface municipalities with structural residential investment potential
                            over a 3–7 year value-add horizon.
                        </p>
                        <p style={{ fontSize: '15px', lineHeight: 1.85, color: '#7a8f7c', margin: 0, fontFamily: "'Inter', sans-serif", fontStyle: 'normal' }}>
                            High score = low soil sealing, high green cover, growing population, and strong
                            connectivity to the nearest regional capital.
                        </p>
                    </RevealSection>

                    <RevealSection delay={0.12}>
                        <div style={{
                            background: 'rgba(123,196,127,0.04)',
                            border: '1px solid rgba(123,196,127,0.14)',
                            borderRadius: '12px',
                            padding: '36px',
                        }}>
                            <div style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7bc47f', marginBottom: '28px', fontFamily: "'Inter', sans-serif" }}>Formula</div>
                            {[
                                { weight: '35%', label: 'Imperviousness Density', note: 'Low sealing → more buildable land' },
                                { weight: '25%', label: 'Tree Cover Density', note: 'Green cover → residential desirability' },
                                { weight: '30%', label: 'Population Growth', note: '2024–2025 · demand signal' },
                                { weight: '10%', label: 'City Access', note: 'Nearest regional capital · connectivity' },
                            ].map(({ weight, label, note }, i) => (
                                <div key={label} style={{
                                    display: 'flex', gap: '16px', marginBottom: i < 3 ? '24px' : 0,
                                    alignItems: 'flex-start',
                                    paddingBottom: i < 3 ? '24px' : 0,
                                    borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                                }}>
                                    <div style={{ fontSize: '20px', fontWeight: 700, color: '#7bc47f', minWidth: '44px', fontStyle: 'italic', fontFamily: "'Georgia', serif" }}>{weight}</div>
                                    <div>
                                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#e8ede9', marginBottom: '3px', fontFamily: "'Inter', sans-serif" }}>{label}</div>
                                        <div style={{ fontSize: '12px', color: '#4a5e4c', fontFamily: "'Inter', sans-serif" }}>{note}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </RevealSection>
                </section>

                <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '0 48px' }} />

                {/* ── Who it's for ── */}
                <section style={{ padding: '90px 48px', maxWidth: '1140px' }}>
                    <RevealSection>
                        <div style={{ fontSize: '11px', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#7bc47f', marginBottom: '20px', fontFamily: "'Inter', sans-serif" }}>Who It's For</div>
                        <h2 style={{ fontSize: '34px', fontWeight: 400, margin: '0 0 56px', fontStyle: 'italic' }}>Built for real estate professionals</h2>
                    </RevealSection>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                        {[
                            { title: 'Fund Managers', body: 'Screen 1,000+ municipalities in seconds. Focus due diligence where structural signals align — not just where prices are low.', icon: '◈' },
                            { title: 'Asset Managers', body: 'Identify value-add opportunities before population growth and greenfield pressure push prices. The score is a leading, not lagging, indicator.', icon: '◉' },
                            { title: 'Acquisitions Teams', body: 'Filter by region, drive time, and growth trajectory. Export ranked lists to brief your investment committee without manual research.', icon: '◎' },
                        ].map(({ title, body, icon }, i) => (
                            <RevealSection key={title} delay={i * 0.1}>
                                <div style={{
                                    background: 'rgba(255,255,255,0.02)',
                                    border: '1px solid rgba(255,255,255,0.07)',
                                    borderRadius: '12px',
                                    padding: '32px 28px',
                                    height: '100%',
                                    transition: 'border-color 0.2s ease, background 0.2s ease',
                                }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(123,196,127,0.2)'; e.currentTarget.style.background = 'rgba(123,196,127,0.03)' }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)' }}
                                >
                                    <div style={{ fontSize: '20px', color: '#7bc47f', marginBottom: '16px' }}>{icon}</div>
                                    <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '12px', color: '#e8ede9', fontFamily: "'Inter', sans-serif" }}>{title}</div>
                                    <p style={{ fontSize: '14px', lineHeight: 1.75, color: '#7a8f7c', margin: 0, fontFamily: "'Inter', sans-serif" }}>{body}</p>
                                </div>
                            </RevealSection>
                        ))}
                    </div>
                </section>

                <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '0 48px' }} />

                {/* ── Methodology ── */}
                <section style={{ padding: '90px 48px', maxWidth: '1140px' }}>
                    <RevealSection>
                        <div style={{ fontSize: '11px', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#7bc47f', marginBottom: '20px', fontFamily: "'Inter', sans-serif" }}>Methodology</div>
                        <h2 style={{ fontSize: '34px', fontWeight: 400, margin: '0 0 52px', fontStyle: 'italic' }}>Open data, reproducible science</h2>
                    </RevealSection>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px' }}>
                        <RevealSection>
                            <h3 style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#7bc47f', marginBottom: '24px', fontFamily: "'Inter', sans-serif" }}>Data Sources</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                                {[
                                    ['Copernicus HRL', 'Imperviousness Density & Tree Cover Density 2021 · 10 m resolution · EPSG:3035'],
                                    ['ISTAT Demo', 'Popolazione residente per comune · 2024 & 2025'],
                                    ['OSRM Routing API', 'Drive time to nearest Italian regional capital · per municipality centroid'],
                                    ['OpenStreetMap', 'Hospitals, schools & railway stations · via Overpass API'],
                                    ['ISTAT Boundaries', 'Comuni 2025 · WGS84 · simplified at 0.001°'],
                                ].map(([source, desc], i, arr) => (
                                    <div key={source} style={{
                                        padding: '18px 0',
                                        borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                                    }}>
                                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#e8ede9', marginBottom: '4px', fontFamily: "'Inter', sans-serif" }}>{source}</div>
                                        <div style={{ fontSize: '12px', color: '#4a5e4c', lineHeight: 1.6, fontFamily: "'Inter', sans-serif" }}>{desc}</div>
                                    </div>
                                ))}
                            </div>
                        </RevealSection>

                        <RevealSection delay={0.12}>
                            <h3 style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#7bc47f', marginBottom: '24px', fontFamily: "'Inter', sans-serif" }}>Important Caveats</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                                {[
                                    'Prospect Score is a structural signal index, not a price forecast',
                                    'TCD is modelled from IMD regression for municipalities outside tile coverage',
                                    'Population growth uses 2024–2025 data (ISTAT Demo)',
                                    'Study area: Lazio, Toscana, Umbria, Abruzzo · 1,048 municipalities',
                                    'Roma Capitale naturally scores low — high imperviousness marks it as already-developed',
                                ].map((text, i, arr) => (
                                    <div key={i} style={{
                                        display: 'flex', gap: '14px', alignItems: 'flex-start',
                                        padding: '16px 0',
                                        borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                                    }}>
                                        <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#7bc47f', flexShrink: 0, marginTop: '6px' }} />
                                        <div style={{ fontSize: '13px', color: '#7a8f7c', lineHeight: 1.6, fontFamily: "'Inter', sans-serif" }}>{text}</div>
                                    </div>
                                ))}
                            </div>
                        </RevealSection>
                    </div>
                </section>

                <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '0 48px' }} />

                {/* ── Contact ── */}
                <section id="contact" style={{ padding: '90px 48px', maxWidth: '680px' }}>
                    <RevealSection>
                        <div style={{ fontSize: '11px', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#7bc47f', marginBottom: '20px', fontFamily: "'Inter', sans-serif" }}>Contact</div>
                        <h2 style={{ fontSize: '34px', fontWeight: 400, margin: '0 0 20px', fontStyle: 'italic' }}>Request access or a demo</h2>
                        <p style={{ fontSize: '15px', lineHeight: 1.85, color: '#a8bfaa', margin: '0 0 48px', fontFamily: "'Inter', sans-serif", fontStyle: 'normal' }}>
                            Urban Prospect is in active development. Reach out to discuss access,
                            custom coverage areas, or integration with your existing investment workflow.
                        </p>

                        {status === 'sent' ? (
                            <div style={{
                                background: 'rgba(123,196,127,0.08)',
                                border: '1px solid rgba(123,196,127,0.25)',
                                borderRadius: '10px',
                                padding: '28px 32px',
                                color: '#7bc47f',
                                fontSize: '15px',
                                fontFamily: "'Inter', sans-serif",
                            }}>
                                ✓ Message received — we'll be in touch shortly.
                            </div>
                        ) : (
                            <div style={{
                                background: 'rgba(255,255,255,0.02)',
                                border: '1px solid rgba(255,255,255,0.07)',
                                borderRadius: '12px',
                                padding: '36px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '20px',
                            }}>
                                {[
                                    { key: 'name', label: 'Name', placeholder: 'Your name', type: 'text' },
                                    { key: 'email', label: 'Email', placeholder: 'your@email.com', type: 'email' },
                                    { key: 'organisation', label: 'Organisation', placeholder: 'Fund / firm name', type: 'text' },
                                ].map(({ key, label, placeholder, type }) => (
                                    <div key={key}>
                                        <label style={labelStyle}>{label}</label>
                                        <input
                                            type={type} name={key}
                                            value={form[key]} onChange={handleChange}
                                            placeholder={placeholder}
                                            style={inputStyle}
                                            onFocus={e => { e.target.style.borderColor = 'rgba(123,196,127,0.4)' }}
                                            onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)' }}
                                        />
                                    </div>
                                ))}
                                <div>
                                    <label style={labelStyle}>Message</label>
                                    <textarea
                                        name="message" value={form.message} onChange={handleChange}
                                        placeholder="What are you looking for?"
                                        rows={4}
                                        style={{ ...inputStyle, resize: 'vertical' }}
                                        onFocus={e => { e.target.style.borderColor = 'rgba(123,196,127,0.4)' }}
                                        onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)' }}
                                    />
                                </div>
                                {status === 'error' && (
                                    <div style={{ color: '#e07070', fontSize: '13px', fontFamily: "'Inter', sans-serif" }}>
                                        Please fill in at least your name and email.
                                    </div>
                                )}
                                <button
                                    onClick={handleSubmit}
                                    disabled={status === 'sending'}
                                    style={{
                                        background: '#7bc47f', color: '#0d1a12', border: 'none',
                                        padding: '14px 32px', borderRadius: '6px', fontWeight: 700,
                                        fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase',
                                        cursor: status === 'sending' ? 'not-allowed' : 'pointer',
                                        alignSelf: 'flex-start', fontFamily: "'Inter', sans-serif",
                                        opacity: status === 'sending' ? 0.6 : 1,
                                        transition: 'background 0.2s ease, opacity 0.2s ease',
                                    }}
                                    onMouseEnter={e => { if (status !== 'sending') e.currentTarget.style.background = '#6ab46e' }}
                                    onMouseLeave={e => { e.currentTarget.style.background = '#7bc47f' }}
                                >
                                    {status === 'sending' ? 'Saving…' : 'Send Message'}
                                </button>
                            </div>
                        )}
                    </RevealSection>
                </section>

                {/* ── Footer ── */}
                <footer style={{
                    padding: '32px 48px',
                    borderTop: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    color: '#2e3f30', fontSize: '12px', fontFamily: "'Inter', sans-serif",
                }}>
                    <div>Urban Prospect · Central Italy</div>
                    <div>Built on Copernicus, ISTAT & OSRM open data</div>
                </footer>
            </div>

            {/* Keyframe for grid animation */}
            <style>{`
                @keyframes landingGridDrift {
                    0%   { transform: translate(0, 0); }
                    100% { transform: translate(48px, 48px); }
                }
            `}</style>
        </div>
    )
}
