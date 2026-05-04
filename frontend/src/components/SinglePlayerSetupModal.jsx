import React, { useState } from 'react';

const DIFFICULTIES = [
    { id: 'easy',   label: 'Easy',   icon: '🟢', desc: 'Short, common words. Great for warming up.', color: '#4ade80' },
    { id: 'medium', label: 'Medium', icon: '🟡', desc: 'Moderate length. A fair challenge.',          color: '#facc15' },
    { id: 'hard',   label: 'Hard',   icon: '🔴', desc: 'Long, obscure words. Experts only.',          color: '#f87171' },
    { id: 'random', label: 'Random', icon: '🎲', desc: 'Mixed bag. Anything goes.',                   color: '#a78bfa' },
];

const ROUND_OPTIONS = [1, 3, 5, 10];

const SinglePlayerSetupModal = ({ show, onClose, onStart }) => {
    const [difficulty, setDifficulty] = useState('');
    const [rounds, setRounds]         = useState(3);
    const [customRounds, setCustomRounds] = useState('');
    const [isCustom, setIsCustom]     = useState(false);
    const [error, setError]           = useState('');

    const handleClose = () => {
        setDifficulty(''); setRounds(3); setCustomRounds('');
        setIsCustom(false); setError(''); onClose();
    };

    const handleRoundOption = (val) => {
        setError('');
        if (val === 'custom') { setIsCustom(true); setRounds(0); }
        else { setIsCustom(false); setRounds(val); setCustomRounds(''); }
    };

    const handleStart = () => {
        if (!difficulty) { setError('Pick a difficulty to continue.'); return; }
        const r = isCustom ? parseInt(customRounds) : rounds;
        if (isNaN(r) || r < 1 || r > 50) { setError('Rounds must be between 1 and 50.'); return; }
        onStart(difficulty, r);
        handleClose();
    };

    const isDisabled = !difficulty || (isCustom && (!customRounds || parseInt(customRounds) < 1 || parseInt(customRounds) > 50));
    const selected = DIFFICULTIES.find(d => d.id === difficulty);

    if (!show) return null;

    return (
        <div className="spsm-overlay" onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}>
            <div className="spsm-panel">
                <div className="spsm-header">
                    <div>
                        <p className="spsm-eyebrow">SOLO ARENA</p>
                        <h2 className="spsm-title">Choose Your Challenge</h2>
                    </div>
                    <button className="spsm-close" onClick={handleClose}>✕</button>
                </div>

                {error && <div className="spsm-error">⚠ {error}</div>}

                <div className="spsm-section">
                    <p className="spsm-label"><span className="spsm-step">01</span> Difficulty</p>
                    <div className="spsm-diff-grid">
                        {DIFFICULTIES.map(d => (
                            <button key={d.id} className={`spsm-diff-card ${difficulty === d.id ? 'active' : ''}`}
                                style={{ '--accent': d.color }}
                                onClick={() => { setDifficulty(d.id); setError(''); }}
                            >
                                <span className="spsm-diff-icon">{d.icon}</span>
                                <span className="spsm-diff-label">{d.label}</span>
                                <span className="spsm-diff-desc">{d.desc}</span>
                                {difficulty === d.id && <span className="spsm-check">✓</span>}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="spsm-section">
                    <p className="spsm-label"><span className="spsm-step">02</span> Rounds</p>
                    <div className="spsm-rounds">
                        {ROUND_OPTIONS.map(n => (
                            <button key={n} className={`spsm-round-btn ${!isCustom && rounds === n ? 'active' : ''}`}
                                onClick={() => handleRoundOption(n)}>{n}</button>
                        ))}
                        <button className={`spsm-round-btn ${isCustom ? 'active' : ''}`} onClick={() => handleRoundOption('custom')}>Custom</button>
                    </div>
                    {isCustom && (
                        <input className="spsm-input" type="number" placeholder="Rounds (1–50)"
                            min="1" max="50" value={customRounds}
                            onChange={(e) => setCustomRounds(e.target.value)} autoFocus />
                    )}
                </div>

                <div className="spsm-footer">
                    <p className="spsm-summary">
                        {selected
                            ? <><span style={{ color: selected.color }}>{selected.label}</span> · {isCustom ? (customRounds || '?') : rounds} round{rounds !== 1 ? 's' : ''}</>
                            : 'No difficulty selected'}
                    </p>
                    <button className="spsm-start-btn" onClick={handleStart} disabled={isDisabled}>Deploy →</button>
                </div>
            </div>

            <style>{`
                .spsm-overlay {
                    position: fixed; inset: 0; background: rgba(0,0,0,0.85);
                    backdrop-filter: blur(8px); display: flex; align-items: center;
                    justify-content: center; z-index: 10000; padding: 20px;
                }
                .spsm-panel {
                    background: #0f0f26; border: 1px solid rgba(139,92,246,0.25);
                    border-radius: 14px; width: 100%; max-width: 580px;
                    max-height: 90vh; overflow-y: auto;
                    box-shadow: 0 0 60px rgba(124,58,237,0.15), 0 32px 80px rgba(0,0,0,0.8);
                    scrollbar-width: thin; scrollbar-color: rgba(139,92,246,0.2) transparent;
                }
                .spsm-header {
                    display: flex; align-items: flex-start; justify-content: space-between;
                    padding: 28px 32px 20px; border-bottom: 1px solid rgba(139,92,246,0.15);
                }
                .spsm-eyebrow { font-size: 10px; letter-spacing: 0.25em; color: #a78bfa; font-family: 'Courier New', monospace; margin: 0 0 6px; }
                .spsm-title { font-size: 20px; font-weight: 700; color: #fff; margin: 0; letter-spacing: -0.02em; }
                .spsm-close {
                    background: none; border: 1px solid rgba(139,92,246,0.2); border-radius: 6px;
                    color: rgba(255,255,255,0.4); width: 30px; height: 30px; cursor: pointer;
                    font-size: 11px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.15s;
                }
                .spsm-close:hover { border-color: rgba(139,92,246,0.6); color: #a78bfa; }
                .spsm-error { background: rgba(239,68,68,0.1); border-bottom: 1px solid rgba(239,68,68,0.25); color: #fca5a5; padding: 10px 32px; font-size: 13px; }
                .spsm-section { padding: 24px 32px; border-bottom: 1px solid rgba(139,92,246,0.1); }
                .spsm-label { display: flex; align-items: center; gap: 10px; font-size: 10px; letter-spacing: 0.2em; color: rgba(167,139,250,0.5); text-transform: uppercase; font-family: 'Courier New', monospace; margin: 0 0 16px; }
                .spsm-step { color: #a78bfa; font-weight: 700; }
                .spsm-diff-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
                .spsm-diff-card {
                    position: relative; background: rgba(139,92,246,0.05);
                    border: 1px solid rgba(139,92,246,0.15); border-radius: 8px;
                    padding: 16px; cursor: pointer; text-align: left;
                    display: flex; flex-direction: column; gap: 4px; transition: all 0.15s;
                }
                .spsm-diff-card:hover { background: rgba(139,92,246,0.1); border-color: rgba(139,92,246,0.35); }
                .spsm-diff-card.active { background: color-mix(in srgb, var(--accent) 12%, transparent); border-color: var(--accent); }
                .spsm-diff-icon { font-size: 18px; margin-bottom: 4px; }
                .spsm-diff-label { font-size: 14px; font-weight: 700; color: #fff; }
                .spsm-diff-card.active .spsm-diff-label { color: var(--accent); }
                .spsm-diff-desc { font-size: 11px; color: rgba(255,255,255,0.3); line-height: 1.4; }
                .spsm-check { position: absolute; top: 8px; right: 10px; color: var(--accent); font-size: 11px; font-weight: 800; }
                .spsm-rounds { display: flex; gap: 8px; flex-wrap: wrap; }
                .spsm-round-btn {
                    background: rgba(139,92,246,0.08); border: 1px solid rgba(139,92,246,0.2);
                    border-radius: 6px; color: rgba(255,255,255,0.45);
                    padding: 8px 20px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.15s;
                }
                .spsm-round-btn:hover { border-color: rgba(139,92,246,0.5); color: #fff; }
                .spsm-round-btn.active { background: rgba(124,58,237,0.25); border-color: #7c3aed; color: #a78bfa; }
                .spsm-input {
                    display: block; margin-top: 12px;
                    background: rgba(139,92,246,0.06); border: 1px solid rgba(139,92,246,0.2);
                    border-radius: 8px; color: #fff; padding: 10px 14px; font-size: 14px;
                    width: 180px; outline: none; transition: border-color 0.15s;
                }
                .spsm-input:focus { border-color: rgba(139,92,246,0.6); }
                .spsm-input::placeholder { color: rgba(255,255,255,0.2); }
                .spsm-footer { display: flex; align-items: center; justify-content: space-between; padding: 20px 32px; gap: 16px; }
                .spsm-summary { font-size: 12px; color: rgba(255,255,255,0.3); font-family: 'Courier New', monospace; margin: 0; }
                .spsm-start-btn {
                    background: #7c3aed; color: #fff; border: none; border-radius: 8px;
                    padding: 11px 28px; font-size: 13px; font-weight: 800;
                    letter-spacing: 0.08em; text-transform: uppercase; cursor: pointer;
                    transition: all 0.2s; white-space: nowrap;
                }
                .spsm-start-btn:hover:not(:disabled) { background: #6d28d9; transform: translateY(-1px); box-shadow: 0 6px 24px rgba(124,58,237,0.4); }
                .spsm-start-btn:disabled { opacity: 0.25; cursor: not-allowed; transform: none; }
                @media (max-width: 480px) {
                    .spsm-header, .spsm-section, .spsm-footer { padding-left: 20px; padding-right: 20px; }
                    .spsm-footer { flex-direction: column; align-items: stretch; }
                    .spsm-start-btn { text-align: center; }
                }
            `}</style>
        </div>
    );
};

export default SinglePlayerSetupModal;