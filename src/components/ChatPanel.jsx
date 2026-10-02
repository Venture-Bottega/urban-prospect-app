import { useState, useRef, useEffect } from 'react'

// The model call lives in /api/chat.js so the API key never reaches the browser.
// That function also owns the system prompt and the tool schema; this component
// only executes the tools the model asks for, against the data already loaded here.
const CHAT_ENDPOINT = '/api/chat'
const MAX_TOOL_ROUNDS = 5

// ── Tool helpers ──────────────────────────────────────────────────────────────
function summarize(n) {
    const idx = {}
    n.indicators?.forEach(i => { idx[i.key] = i })
    return {
        id:               n.id,
        name:             n.name,
        region:           n.region,
        prospectScore:    n.prospectScore,
        imperviousness:   idx.imperviousnessDensity?.value,
        treeCover:        idx.treeCoverDensity?.value,
        populationGrowth: idx.populationGrowth?.value,
        driveMinutes:     idx.accessibilityCity?.value,
        nearestCity:      idx.accessibilityCity?.nearestCity,
        price_mid:        n.price?.mid        ?? null,
        price_signal:     n.price?.signal      ?? null,
        price_growth:     n.price?.growth_pct  ?? null,
        hospitals:        n.infrastructure?.hospitals          ?? null,
        schools:          n.infrastructure?.schools            ?? null,
        railway:          n.infrastructure?.railway_stations   ?? null,
        lisa:             n.lisa?.label        ?? 'ns',
        lisa_p:           n.lisa?.p            ?? null,
        lisa_price:       n.lisa_price?.label  ?? 'ns',
        lisa_price_p:     n.lisa_price?.p      ?? null,
        scoreMin:         n.scoreMin,
        scoreMax:         n.scoreMax,
    }
}

function runTool(name, args, neighborhoods) {
    switch (name) {
        case 'filter_municipalities': {
            let r = neighborhoods
            if (args.region)        r = r.filter(n => n.region?.toLowerCase().includes(args.region.toLowerCase()))
            if (args.min_score != null)   r = r.filter(n => n.prospectScore >= args.min_score)
            if (args.max_score != null)   r = r.filter(n => n.prospectScore <= args.max_score)
            if (args.max_price != null)   r = r.filter(n => n.price?.mid != null && n.price.mid <= args.max_price)
            if (args.min_price != null)   r = r.filter(n => n.price?.mid != null && n.price.mid >= args.min_price)
            if (args.min_tcd != null) {
                r = r.filter(n => {
                    const ind = n.indicators?.find(i => i.key === 'treeCoverDensity')
                    return ind != null && ind.value >= args.min_tcd
                })
            }
            if (args.max_imd != null) {
                r = r.filter(n => {
                    const ind = n.indicators?.find(i => i.key === 'imperviousnessDensity')
                    return ind != null && ind.value <= args.max_imd
                })
            }
            if (args.min_pop_growth != null) {
                r = r.filter(n => {
                    const ind = n.indicators?.find(i => i.key === 'populationGrowth')
                    return ind != null && ind.value >= args.min_pop_growth
                })
            }
            if (args.lisa_label)        r = r.filter(n => n.lisa?.label       === args.lisa_label)
            if (args.lisa_price_label)  r = r.filter(n => n.lisa_price?.label === args.lisa_price_label)

            const limit = Math.min(args.limit || 5, 10)
            return r
                .sort((a, b) => b.prospectScore - a.prospectScore)
                .slice(0, limit)
                .map(summarize)
        }

        case 'get_municipality_detail': {
            const n = neighborhoods.find(m =>
                m.name.toLowerCase().includes(args.name.toLowerCase())
            )
            return n ? summarize(n) : { error: `Municipality "${args.name}" not found.` }
        }

        case 'compare_municipalities': {
            return args.names.map(name => {
                const n = neighborhoods.find(m =>
                    m.name.toLowerCase().includes(name.toLowerCase())
                )
                return n ? summarize(n) : { error: `"${name}" not found.`, name }
            })
        }

        case 'find_similar': {
            const ref = neighborhoods.find(m =>
                m.name.toLowerCase().includes(args.name.toLowerCase())
            )
            if (!ref) return { error: `"${args.name}" not found.` }
            const refScores = ref.indicators?.map(i => i.score ?? 0) ?? []
            const ranked = neighborhoods
                .filter(n => n.id !== ref.id)
                .map(n => {
                    const s = n.indicators?.map(i => i.score ?? 0) ?? []
                    const dist = Math.sqrt(refScores.reduce((sum, v, i) => sum + (v - (s[i] ?? 0)) ** 2, 0))
                    return { ...n, _dist: dist }
                })
                .sort((a, b) => a._dist - b._dist)
                .slice(0, Math.min(args.limit || 5, 10))
            return { reference: summarize(ref), similar: ranked.map(summarize) }
        }

        default:
            return { error: `Unknown tool: ${name}` }
    }
}

// ── LISA badge helper ─────────────────────────────────────────────────────────
const LISA_META = {
    HH: { color: '#1a7a4a', bg: '#e6f5ee', text: 'Growth Corridor' },
    HL: { color: '#c47b00', bg: '#fdf3e0', text: 'Isolated Performer' },
    LH: { color: '#4a7ab5', bg: '#eaf0fa', text: 'Lagging Area' },
    LL: { color: '#8b3535', bg: '#f9e9e9', text: 'Cold Spot' },
    ns: { color: '#888',    bg: '#f0f0ee', text: 'Not Significant' },
}

// ── Suggestion chips ──────────────────────────────────────────────────────────
const SUGGESTIONS = [
    'Best value towns in Tuscany under €1,500/m²',
    'Find isolated performers (HL) in southern Italy',
    'Compare Collesalvetti and Grosseto',
    'Which comuni are part of growth corridors near Milan?',
    'Explain what a LISA cluster means',
]

// ── MuniCard: clickable result card inside chat ───────────────────────────────
function MuniCard({ muni, onSelect }) {
    const lisa = LISA_META[muni.lisa] ?? LISA_META.ns
    const score = muni.prospectScore ?? 0
    return (
        <button
            className="chat-muni-card"
            onClick={() => onSelect && onSelect(muni.id)}
            title={`View ${muni.name} on map`}
        >
            <div className="chat-muni-card__header">
                <span className="chat-muni-card__name">{muni.name}</span>
                <span className="chat-muni-card__region">{muni.region}</span>
            </div>
            <div className="chat-muni-card__row">
                <div className="chat-muni-card__score-bar">
                    <div className="chat-muni-card__score-fill" style={{ width: `${score}%` }} />
                </div>
                <span className="chat-muni-card__score-val">{score.toFixed(1)}</span>
            </div>
            <div className="chat-muni-card__meta">
                {muni.price_mid && (
                    <span className="chat-muni-card__pill">€{muni.price_mid.toLocaleString()}/m²</span>
                )}
                <span
                    className="chat-muni-card__pill"
                    style={{ color: lisa.color, background: lisa.bg }}
                >
                    {muni.lisa}
                </span>
                <span className="chat-muni-card__cta">View →</span>
            </div>
        </button>
    )
}

// ── TypingDots ────────────────────────────────────────────────────────────────
function TypingDots({ label }) {
    return (
        <div className="chat-typing">
            <span className="chat-typing__dots">
                <span /><span /><span />
            </span>
            {label && <span className="chat-typing__label">{label}</span>}
        </div>
    )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ChatPanel({ neighborhoods, onSelectMunicipality, onClose }) {
    const [messages,   setMessages]   = useState([])
    const [input,      setInput]      = useState('')
    const [thinking,   setThinking]   = useState(null)   // null | string label
    const messagesEndRef = useRef(null)
    const inputRef       = useRef(null)
    const convoRef       = useRef([])   // conversation sent to /api/chat

    // Auto-scroll to newest message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, thinking])

    // Focus input on open
    useEffect(() => {
        setTimeout(() => inputRef.current?.focus(), 150)
    }, [])

    // One round-trip to the proxy. Throws with a user-facing message on failure.
    async function askModel(conversation) {
        const res = await fetch(CHAT_ENDPOINT, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ messages: conversation }),
        })

        if (!res.ok) {
            const detail = await res.json().catch(() => ({}))
            throw new Error(detail.error ?? `Chat service error (${res.status}).`)
        }

        const { message } = await res.json()
        if (!message) throw new Error('The chat service returned an empty response.')
        return message
    }

    async function send(text) {
        const userText = (text ?? input).trim()
        if (!userText || thinking) return
        setInput('')

        // Append user message
        setMessages(prev => [...prev, { role: 'user', content: userText, id: Date.now() }])

        setThinking('Thinking…')
        // Work on a copy: the conversation is only committed once the turn succeeds,
        // so a failed request can't leave a half-finished tool exchange behind.
        const conversation = [...convoRef.current, { role: 'user', content: userText }]
        let toolResults = []

        try {
            let reply = await askModel(conversation)
            conversation.push(reply)

            // Tool-calling loop — the model may chain several calls before answering.
            // Capped: a model that keeps re-calling the same tool would otherwise spin.
            let rounds = 0
            while (reply.tool_calls?.length > 0) {
                if (++rounds > MAX_TOOL_ROUNDS) {
                    throw new Error('The assistant got stuck looking things up. Try rephrasing your question.')
                }
                for (const call of reply.tool_calls) {
                    const name = call.function?.name
                    let args = {}
                    try {
                        args = JSON.parse(call.function?.arguments || '{}')
                    } catch {
                        args = {}
                    }

                    setThinking(`Querying ${name === 'filter_municipalities'
                        ? `${neighborhoods.length.toLocaleString()} municipalities`
                        : args?.name ?? 'data'}…`)

                    const out = runTool(name, args, neighborhoods)
                    toolResults = Array.isArray(out) ? out : (out.similar ?? (out.error ? [] : [out]))

                    conversation.push({
                        role:         'tool',
                        tool_call_id: call.id,
                        content:      JSON.stringify(out),
                    })
                }

                reply = await askModel(conversation)
                conversation.push(reply)
            }

            convoRef.current = conversation

            setMessages(prev => [...prev, {
                role:    'assistant',
                content: reply.content ?? '',
                results: toolResults.length > 0 ? toolResults : null,
                id:      Date.now() + 1,
            }])
        } catch (err) {
            console.error('Chat error:', err)
            const msg = err.message ?? ''
            const friendly = msg.includes('Failed to fetch') || msg.includes('NetworkError')
                ? '🌐 Network error — check your internet connection and try again.'
                : msg || 'Something went wrong. Please try again.'
            setMessages(prev => [...prev, {
                role: 'assistant', content: friendly, results: null, id: Date.now() + 1,
            }])
        } finally {
            setThinking(null)
        }
    }

    function handleKey(e) {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
    }

    return (
        <div className="chat-panel">
            {/* Header */}
            <div className="chat-panel__header">
                <div className="chat-panel__header-left">
                    <span className="chat-panel__dot" />
                    <span className="chat-panel__title">Urban Prospect AI</span>
                </div>
                <button className="chat-panel__close" onClick={onClose} aria-label="Close chat">✕</button>
            </div>

            {/* Messages */}
            <div className="chat-panel__messages">
                {messages.length === 0 && (
                    <div className="chat-welcome">
                        <p className="chat-welcome__text">
                            Ask me anything about Italian municipalities — investment profiles, price trends,
                            spatial clusters, or indicator comparisons.
                        </p>
                        <div className="chat-suggestions">
                            {SUGGESTIONS.map(s => (
                                <button key={s} className="chat-suggestion" onClick={() => send(s)}>
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {messages.map(msg => (
                    <div key={msg.id} className={`chat-message chat-message--${msg.role}`}>
                        {msg.role === 'assistant' && (
                            <div className="chat-message__avatar">AI</div>
                        )}
                        <div className="chat-message__bubble">
                            <p className="chat-message__text">{msg.content}</p>
                            {msg.results?.length > 0 && (
                                <div className="chat-message__results">
                                    {msg.results.map(m => (
                                        <MuniCard
                                            key={m.id}
                                            muni={m}
                                            onSelect={id => {
                                                const full = neighborhoods.find(n => n.id === id)
                                                if (full) onSelectMunicipality?.(full)
                                            }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {thinking && (
                    <div className="chat-message chat-message--assistant">
                        <div className="chat-message__avatar">AI</div>
                        <TypingDots label={thinking} />
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="chat-panel__input-area">
                <textarea
                    ref={inputRef}
                    className="chat-panel__input"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKey}
                    placeholder="Ask about any municipality or region…"
                    rows={1}
                    disabled={!!thinking}
                />
                <button
                    className="chat-panel__send"
                    onClick={() => send()}
                    disabled={!input.trim() || !!thinking}
                    aria-label="Send"
                >
                    ↑
                </button>
            </div>
        </div>
    )
}
