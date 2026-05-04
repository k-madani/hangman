import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

const API = 'http://localhost:5000/api/auth';

export const AuthProvider = ({ children }) => {
    const [user, setUser]               = useState(null);       // { id, username, email, stats }
    const [accessToken, setAccessToken] = useState(null);       // Kept in memory only (not localStorage)
    const [loading, setLoading]         = useState(true);       // True while restoring session on mount

    // ── Session Restore ───────────────────────────────────────────
    // On every page load, try to get a new access token using the
    // httpOnly refresh cookie (transparent to JS, sent automatically).
    useEffect(() => {
        const restoreSession = async () => {
            try {
                const res = await fetch(`${API}/refresh`, {
                    method: 'POST',
                    credentials: 'include' // Sends the httpOnly cookie
                });
                if (res.ok) {
                    const data = await res.json();
                    setAccessToken(data.accessToken);
                    setUser(data.user);
                }
            } catch {
                // No session — user stays logged out
            } finally {
                setLoading(false);
            }
        };
        restoreSession();
    }, []);

    // ── Proactive Token Refresh ───────────────────────────────────
    // Access tokens expire in 15 min. Refresh every 14 min while active.
    useEffect(() => {
        if (!accessToken) return;
        const interval = setInterval(async () => {
            try {
                const res = await fetch(`${API}/refresh`, {
                    method: 'POST',
                    credentials: 'include'
                });
                if (res.ok) {
                    const data = await res.json();
                    setAccessToken(data.accessToken);
                    setUser(data.user);
                } else {
                    // Refresh token also expired — log out
                    setAccessToken(null);
                    setUser(null);
                }
            } catch {
                setAccessToken(null);
                setUser(null);
            }
        }, 14 * 60 * 1000); // 14 minutes

        return () => clearInterval(interval);
    }, [accessToken]);

    // ── Auth Actions ──────────────────────────────────────────────

    const register = useCallback(async (username, email, password) => {
        const res = await fetch(`${API}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ username, email, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Registration failed');
        setAccessToken(data.accessToken);
        setUser(data.user);
    }, []);

    const login = useCallback(async (email, password) => {
        const res = await fetch(`${API}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Login failed');
        setAccessToken(data.accessToken);
        setUser(data.user);
    }, []);

    const logout = useCallback(async () => {
        try {
            await fetch(`${API}/logout`, {
                method: 'POST',
                credentials: 'include'
            });
        } finally {
            setAccessToken(null);
            setUser(null);
        }
    }, []);

    // ── Authenticated Fetch Helper ────────────────────────────────
    // Use this for any API call that requires a valid access token.
    const authFetch = useCallback(async (url, options = {}) => {
        return fetch(url, {
            ...options,
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
                Authorization: `Bearer ${accessToken}`
            }
        });
    }, [accessToken]);

    const value = {
        user,
        accessToken,
        loading,
        setUser,
        isLoggedIn: !!user,
        register,
        login,
        logout,
        authFetch
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
    return ctx;
};