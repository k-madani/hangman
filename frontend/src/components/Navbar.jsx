import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ onSignIn, onOpenProfile }) => {
    const navigate  = useNavigate();
    const location  = useLocation();
    const { user, logout } = useAuth();
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);
    const isHome = location.pathname === '/';

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <nav className="navbar">
            {/* Left: Logo */}
            <button className="navbar-logo" onClick={() => navigate('/')}>
                {!isHome && <span className="navbar-back">←</span>}
                WORD ARENA
            </button>

            {/* Right: Auth */}
            <div className="navbar-right">
                {user ? (
                    <div className="navbar-dropdown-wrap" ref={dropdownRef}>
                        <button
                            className="navbar-profile"
                            onClick={() => setOpen(prev => !prev)}
                        >
                            <span className="navbar-avatar">
                                {user.username.charAt(0).toUpperCase()}
                            </span>
                            <span className="navbar-username">{user.username}</span>
                            <span className="navbar-chevron">{open ? '▲' : '▼'}</span>
                        </button>

                        {open && (
                            <div className="navbar-dropdown">
                                <button
                                    className="navbar-dd-item"
                                    onClick={() => { setOpen(false); onOpenProfile(); }}
                                >
                                    👤 View Profile
                                </button>
                                <div className="navbar-dd-divider" />
                                <button
                                    className="navbar-dd-item navbar-dd-danger"
                                    onClick={() => { setOpen(false); logout(); }}
                                >
                                    → Sign Out
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <button className="navbar-signin" onClick={onSignIn}>
                        Sign In
                    </button>
                )}
            </div>
        </nav>
    );
};

export default Navbar;