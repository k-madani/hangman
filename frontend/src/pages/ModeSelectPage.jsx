import React, { useState } from 'react';
import SinglePlayerSetupModal from '../components/SinglePlayerSetupModal';
import MultiplayerSetupModal from '../components/MultiplayerSetupModal';

// onCreateRoom and onJoinRoom are new — passed down from App.jsx
const ModeSelectPage = ({ onSelectMode, onBack, onCreateRoom, onJoinRoom, joinError, onClearJoinError }) => {
    const [showSinglePlayerModal, setShowSinglePlayerModal] = useState(false);
    const [showMultiplayerModal, setShowMultiplayerModal] = useState(false);

    const handleSinglePlayerStart = (category, rounds) => {
        setShowSinglePlayerModal(false);
        onSelectMode('single', { category, rounds });
    };

    return (
        <>
            <div className="mode-page-wrapper">
                <div className="corner-logo" onClick={onBack}>
                    WORD ARENA
                </div>

                <div className="centered-mode-container">
                    <div className="mode-cards-wrapper">
                        <div className="mode-box single-player-box">
                            <div className="mode-box-content">
                                <div className="mode-icon-large">🎮</div>
                                <h2 className="mode-box-title">SINGLE PLAYER</h2>
                                <p className="mode-box-description">
                                    Challenge yourself against the AI. Test your vocabulary and strategy skills.
                                </p>
                                <div className="mode-box-features">
                                    <div className="feature-row"><span className="check-icon">✓</span><span>AI Opponent</span></div>
                                    <div className="feature-row"><span className="check-icon">✓</span><span>Multiple Categories</span></div>
                                    <div className="feature-row"><span className="check-icon">✓</span><span>Practice Mode</span></div>
                                </div>
                                <button
                                    className="mode-start-btn single-start-btn"
                                    onClick={() => setShowSinglePlayerModal(true)}
                                >
                                    Start Solo Battle →
                                </button>
                            </div>
                        </div>

                        <div className="mode-divider">
                            <div className="vs-badge">VS</div>
                        </div>

                        <div className="mode-box multiplayer-box">
                            <div className="mode-box-content">
                                <div className="mode-icon-large">⚔️</div>
                                <h2 className="mode-box-title">MULTIPLAYER</h2>
                                <p className="mode-box-description">
                                    Battle a friend in real-time. Set custom words and compete head-to-head.
                                </p>
                                <div className="mode-box-features">
                                    <div className="feature-row"><span className="check-icon">✓</span><span>Real-Time PvP</span></div>
                                    <div className="feature-row"><span className="check-icon">✓</span><span>Shareable Room Code</span></div>
                                    <div className="feature-row"><span className="check-icon">✓</span><span>Turn-Based</span></div>
                                </div>
                                <button
                                    className="mode-start-btn multi-start-btn"
                                    onClick={() => {
                                        onClearJoinError();
                                        setShowMultiplayerModal(true);
                                    }}
                                >
                                    Join the Arena →
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <SinglePlayerSetupModal
                show={showSinglePlayerModal}
                onClose={() => setShowSinglePlayerModal(false)}
                onStart={handleSinglePlayerStart}
            />

            <MultiplayerSetupModal
                show={showMultiplayerModal}
                onClose={() => setShowMultiplayerModal(false)}
                onStart={(action, options) => {
                    if (action === 'create') {
                        setShowMultiplayerModal(false);
                        onCreateRoom(options.rounds);
                    } else if (action === 'join') {
                        onJoinRoom(options.roomId);
                    }
                }}
                joinError={joinError}
            />
        </>
    );
};

export default ModeSelectPage;