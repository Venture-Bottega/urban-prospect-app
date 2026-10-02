import { SignIn, SignUp, useUser } from '@clerk/react'
import { useState, useEffect } from 'react'

// Shared Clerk appearance — dark theme, hides Clerk's own footer nav
// (we use our own mode toggle instead)
const clerkAppearance = {
    elements: {
        // Hide Clerk's built-in "Don't have an account?" / "Already have one?" footer
        footerAction: { display: 'none' },
        // Transparent card so our background shows through
        card: {
            background: 'transparent',
            boxShadow: 'none',
            border: 'none',
        },
        rootBox: { width: '100%' },
        // Header text
        headerTitle: { color: '#e8ede9' },
        headerSubtitle: { color: '#7a8f7c' },
        // Inputs
        formFieldInput: {
            background: 'rgba(255,255,255,0.05)',
            borderColor: 'rgba(123,196,127,0.25)',
            color: '#e8ede9',
        },
        formFieldLabel: { color: '#7a8f7c' },
        // Primary button
        formButtonPrimary: {
            background: '#7bc47f',
            color: '#0d1a12',
            fontWeight: '700',
        },
        // Social (Google) button
        socialButtonsBlockButton: {
            background: 'rgba(255,255,255,0.04)',
            borderColor: 'rgba(123,196,127,0.2)',
            color: '#e8ede9',
        },
        socialButtonsBlockButtonText: { color: '#e8ede9' },
        // Divider "or"
        dividerLine: { background: 'rgba(255,255,255,0.08)' },
        dividerText: { color: '#4a5e4c' },
        // "Secured by Clerk" footer
        footer: {
            background: 'transparent',
            borderTop: '1px solid rgba(123,196,127,0.08)',
        },
        footerPages: { background: 'transparent' },
        // Internal badge row
        badge: { background: 'transparent', color: '#4a5e4c' },
    },
}

export default function AuthPage({ onAuthenticated, onBack }) {
    const { isSignedIn, isLoaded } = useUser()
    const [mode, setMode] = useState('signin') // 'signin' | 'signup'
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        const t = setTimeout(() => setMounted(true), 30)
        return () => clearTimeout(t)
    }, [])

    // Already signed in → skip straight to map
    useEffect(() => {
        if (isLoaded && isSignedIn) onAuthenticated()
    }, [isLoaded, isSignedIn, onAuthenticated])

    if (!isLoaded) {
        return (
            <div style={{ minHeight: '100vh', background: '#0d1a12', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="auth-spinner" />
            </div>
        )
    }

    return (
        <div className="auth-page">
            <div className="auth-bg-grid" />

            {/* ── Left branding panel ── */}
            <div className={`auth-brand ${mounted ? 'auth-brand--in' : ''}`}>
                <div className="auth-brand__logo">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                        <rect width="32" height="32" rx="6" fill="rgba(123,196,127,0.15)" />
                        <path d="M8 22 L16 10 L24 22" stroke="#7bc47f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M11 18 L16 10 L21 18" stroke="#7bc47f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="rgba(123,196,127,0.15)" />
                        <circle cx="16" cy="10" r="2" fill="#7bc47f" />
                    </svg>
                    <span className="auth-brand__name">Urban Prospect</span>
                </div>

                <div className="auth-brand__copy">
                    <div className="auth-brand__eyebrow">Territorial Intelligence</div>
                    <h1 className="auth-brand__headline">
                        Where should<br />
                        <em>you invest next?</em>
                    </h1>
                    <p className="auth-brand__sub">
                        Satellite-powered screening across Central Italy —
                        1,048 municipalities ranked by structural opportunity.
                    </p>
                </div>

                <div className="auth-brand__stats">
                    {[
                        { num: '1,048', label: 'Municipalities' },
                        { num: '5',     label: 'Data Sources' },
                        { num: '4',     label: 'Regions' },
                    ].map(({ num, label }) => (
                        <div key={label} className="auth-stat">
                            <div className="auth-stat__num">{num}</div>
                            <div className="auth-stat__label">{label}</div>
                        </div>
                    ))}
                </div>

                <div className="auth-brand__bars">
                    {[85, 72, 61, 54, 48, 39].map((w, i) => (
                        <div key={i} className="auth-bar-row">
                            <div
                                className="auth-bar-fill"
                                style={{ width: mounted ? `${w}%` : '0%', transitionDelay: `${0.4 + i * 0.08}s` }}
                            />
                            <span className="auth-bar-val">{w}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Right form panel ── */}
            <div className={`auth-form-panel ${mounted ? 'auth-form-panel--in' : ''}`}>
                <div className="auth-form-inner">

                    {/* Mode toggle — our own, replaces Clerk's footer links */}
                    <div className="auth-mode-toggle">
                        <button
                            id="auth-signin-tab"
                            className={`auth-mode-btn ${mode === 'signin' ? 'auth-mode-btn--active' : ''}`}
                            onClick={() => setMode('signin')}
                        >
                            Sign In
                        </button>
                        <button
                            id="auth-signup-tab"
                            className={`auth-mode-btn ${mode === 'signup' ? 'auth-mode-btn--active' : ''}`}
                            onClick={() => setMode('signup')}
                        >
                            Create Account
                        </button>
                    </div>

                    {/* Clerk — appearance hides its own footer nav links */}
                    <div className="auth-clerk-wrap">
                        {mode === 'signin' ? (
                            <SignIn
                                routing="virtual"
                                appearance={clerkAppearance}
                                afterSignInUrl="/"
                            />
                        ) : (
                            <SignUp
                                routing="virtual"
                                appearance={clerkAppearance}
                                afterSignUpUrl="/"
                            />
                        )}
                    </div>

                    {/* Back to landing — proper state-based navigation */}
                    <button
                        id="auth-back-btn"
                        className="auth-back-link"
                        onClick={onBack}
                    >
                        ← Back to landing page
                    </button>
                </div>
            </div>
        </div>
    )
}
