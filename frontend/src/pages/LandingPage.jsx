import React from 'react';
import { useAuth } from '../context/AuthContext';

const LandingPage = ({ onStart, onSignIn }) => {
    const { user, logout } = useAuth();

    return (
        <div className="dashboard-layout">
            <div className="teaser-side">
                <div className="floating-card">
                    <div className="preview-word">
                        <span>W</span><span>O</span><span>R</span><span>D</span>
                        <span className="underscore">_</span>
                        <span className="underscore">_</span>
                    </div>
                    <div className="preview-hint">Hint: The battlefield of wits</div>
                </div>
            </div>

            <div className="content-side">
                <h1 className="logo">WORD ARENA</h1>
                <p className="tagline">
                    The ultimate social word game. Challenge friends in real-time PvP 
                    or sharpen your skills against our AI.
                </p>
                <div className="landing-actions">
                    <button className="primary-btn" onClick={onStart}>
                        START PLAYING
                    </button>
                    {user ? (
                        <div className="landing-user">
                            <span className="landing-username">👤 {user.username}</span>
                            <button className="landing-signout" onClick={logout}>Sign Out</button>
                        </div>
                    ) : (
                        <button className="landing-signin" onClick={onSignIn}>
                            Sign In
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LandingPage;