import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const AuthPage = ({ onSuccess, onBack }) => {
    const { login, register } = useAuth();

    const [tab, setTab]           = useState('login');    // 'login' | 'register'
    const [email, setEmail]       = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm]   = useState('');
    const [error, setError]       = useState('');
    const [loading, setLoading]   = useState(false);

    const resetForm = () => {
        setEmail(''); setUsername(''); setPassword(''); setConfirm(''); setError('');
    };

    const switchTab = (t) => { setTab(t); resetForm(); };

    const validate = () => {
        if (!email || !password) return 'All fields are required.';
        if (!/^\S+@\S+\.\S+$/.test(email)) return 'Enter a valid email address.';
        if (password.length < 8) return 'Password must be at least 8 characters.';
        if (tab === 'register') {
            if (!username) return 'Username is required.';
            if (!/^[a-zA-Z0-9_]{3,20}$/.test(username))
                return 'Username: 3–20 chars, letters/numbers/underscore only.';
            if (password !== confirm) return 'Passwords do not match.';
        }
        return null;
    };

    const handleSubmit = async () => {
        const validationError = validate();
        if (validationError) { setError(validationError); return; }

        setLoading(true);
        setError('');

        try {
            if (tab === 'login') {
                await login(email, password);
            } else {
                await register(username, email, password);
            }
            onSuccess();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleKey = (e) => { if (e.key === 'Enter') handleSubmit(); };

    return (
        <div className="auth-overlay">
            <div className="auth-panel">

                {/* Header */}
                <div className="auth-header">
                    <div>
                        <p className="auth-eyebrow">WORD ARENA</p>
                        <h2 className="auth-title">
                            {tab === 'login' ? 'Welcome Back' : 'Create Account'}
                        </h2>
                    </div>
                    <button className="auth-close" onClick={onBack}>✕</button>
                </div>

                {/* Tabs */}
                <div className="auth-tabs">
                    <button
                        className={`auth-tab ${tab === 'login' ? 'active' : ''}`}
                        onClick={() => switchTab('login')}
                    >
                        Sign In
                    </button>
                    <button
                        className={`auth-tab ${tab === 'register' ? 'active' : ''}`}
                        onClick={() => switchTab('register')}
                    >
                        Register
                    </button>
                </div>

                {/* Error */}
                {error && <div className="auth-error">⚠ {error}</div>}

                {/* Form */}
                <div className="auth-body">
                    {tab === 'register' && (
                        <div className="auth-field">
                            <label className="auth-label">Username</label>
                            <input
                                className="auth-input"
                                type="text"
                                placeholder="letters, numbers, underscores"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                onKeyDown={handleKey}
                                maxLength={20}
                                autoFocus
                            />
                        </div>
                    )}

                    <div className="auth-field">
                        <label className="auth-label">Email</label>
                        <input
                            className="auth-input"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onKeyDown={handleKey}
                            autoFocus={tab === 'login'}
                        />
                    </div>

                    <div className="auth-field">
                        <label className="auth-label">Password</label>
                        <input
                            className="auth-input"
                            type="password"
                            placeholder="min. 8 characters"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={handleKey}
                        />
                    </div>

                    {tab === 'register' && (
                        <div className="auth-field">
                            <label className="auth-label">Confirm Password</label>
                            <input
                                className="auth-input"
                                type="password"
                                placeholder="repeat your password"
                                value={confirm}
                                onChange={(e) => setConfirm(e.target.value)}
                                onKeyDown={handleKey}
                            />
                        </div>
                    )}

                    <button
                        className="auth-submit"
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading
                            ? 'Please wait...'
                            : tab === 'login' ? 'Enter Arena →' : 'Create Account →'
                        }
                    </button>
                </div>
            </div>

            <style>{`
                .auth-overlay {
                    position: fixed; inset: 0;
                    background: rgba(0,0,0,0.88);
                    backdrop-filter: blur(8px);
                    display: flex; align-items: center; justify-content: center;
                    z-index: 1000; padding: 20px;
                }
                .auth-panel {
                    background: #0d0d0f;
                    border: 1px solid rgba(255,255,255,0.08);
                    width: 100%; max-width: 420px;
                    box-shadow: 0 0 80px rgba(0,255,200,0.05), 0 32px 80px rgba(0,0,0,0.9);
                }
                .auth-header {
                    display: flex; align-items: flex-start; justify-content: space-between;
                    padding: 28px 32px 20px;
                    border-bottom: 1px solid rgba(255,255,255,0.06);
                }
                .auth-eyebrow {
                    font-size: 10px; letter-spacing: 0.25em;
                    color: #00ffc8; font-family: 'Courier New', monospace;
                    margin: 0 0 6px;
                }
                .auth-title {
                    font-size: 20px; font-weight: 700; color: #fff;
                    margin: 0; letter-spacing: -0.02em;
                }
                .auth-close {
                    background: none; border: 1px solid rgba(255,255,255,0.1);
                    color: rgba(255,255,255,0.4); width: 30px; height: 30px;
                    cursor: pointer; font-size: 11px;
                    display: flex; align-items: center; justify-content: center;
                    transition: all 0.15s; flex-shrink: 0;
                }
                .auth-close:hover { border-color: rgba(255,255,255,0.35); color: #fff; }
                .auth-tabs {
                    display: flex;
                    border-bottom: 1px solid rgba(255,255,255,0.06);
                }
                .auth-tab {
                    flex: 1; padding: 12px;
                    background: none; border: none;
                    color: rgba(255,255,255,0.35);
                    font-size: 13px; font-weight: 600;
                    cursor: pointer; transition: all 0.15s;
                    border-bottom: 2px solid transparent;
                    letter-spacing: 0.04em;
                }
                .auth-tab.active {
                    color: #00ffc8;
                    border-bottom-color: #00ffc8;
                }
                .auth-tab:hover:not(.active) { color: rgba(255,255,255,0.6); }
                .auth-error {
                    background: rgba(239,68,68,0.1);
                    border-bottom: 1px solid rgba(239,68,68,0.25);
                    color: #fca5a5; padding: 10px 32px;
                    font-size: 13px; font-weight: 500;
                }
                .auth-body {
                    padding: 24px 32px 28px;
                    display: flex; flex-direction: column; gap: 16px;
                }
                .auth-field {
                    display: flex; flex-direction: column; gap: 6px;
                }
                .auth-label {
                    font-size: 10px; letter-spacing: 0.18em;
                    color: rgba(255,255,255,0.35);
                    text-transform: uppercase;
                    font-family: 'Courier New', monospace;
                }
                .auth-input {
                    background: rgba(255,255,255,0.04);
                    border: 1px solid rgba(255,255,255,0.1);
                    color: #fff; padding: 11px 14px;
                    font-size: 14px; outline: none; width: 100%;
                    box-sizing: border-box; transition: border-color 0.15s;
                }
                .auth-input:focus { border-color: rgba(0,255,200,0.45); }
                .auth-input::placeholder { color: rgba(255,255,255,0.2); }
                .auth-submit {
                    margin-top: 4px;
                    background: #00ffc8; color: #000; border: none;
                    padding: 13px; font-size: 13px; font-weight: 800;
                    letter-spacing: 0.08em; text-transform: uppercase;
                    cursor: pointer; transition: all 0.15s; width: 100%;
                }
                .auth-submit:hover:not(:disabled) { background: #fff; transform: translateY(-1px); }
                .auth-submit:disabled { opacity: 0.35; cursor: not-allowed; transform: none; }

                @media (max-width: 480px) {
                    .auth-header, .auth-body { padding-left: 20px; padding-right: 20px; }
                }
            `}</style>
        </div>
    );
};

export default AuthPage;