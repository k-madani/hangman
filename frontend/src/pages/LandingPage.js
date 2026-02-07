import React from 'react';

const LandingPage = ({ onStart }) => {
    return (
        <div className="dashboard-layout">
            {/* LEFT SIDE: The Teaser */}
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

            {/* RIGHT SIDE: The Intro */}
            <div className="content-side">
                <h1 className="logo">WORD ARENA</h1>
                <p className="tagline">
                    The ultimate social word game. Challenge friends in real-time PvP 
                    or sharpen your skills against our AI.
                </p>
                <button className="primary-btn" onClick={onStart}>
                    START PLAYING
                </button>
            </div>
        </div>
    );
};

export default LandingPage;
