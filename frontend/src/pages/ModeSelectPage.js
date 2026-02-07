import React, { useState } from 'react';
import SinglePlayerSetupModal from '../components/SinglePlayerSetupModal';
import MultiplayerSetupModal from '../components/MultiplayerSetupModal';

const ModeSelectPage = ({ onSelectMode, onBack }) => {
    const [showSinglePlayerModal, setShowSinglePlayerModal] = useState(false);
    const [showMultiplayerModal, setShowMultiplayerModal] = useState(false);

    const handleSinglePlayerStart = (category, rounds) => {
        console.log('=== MODE SELECT: handleSinglePlayerStart called ===');
        console.log('Category:', category);
        console.log('Rounds:', rounds);
        
        // Close modal FIRST
        setShowSinglePlayerModal(false);
        
        // Then call parent's onSelectMode
        console.log('=== MODE SELECT: Calling onSelectMode ===');
        onSelectMode('single', { category, rounds });
    };

    const handleMultiplayerStart = (roomId, rounds) => {
        console.log('=== MODE SELECT: handleMultiplayerStart called ===');
        console.log('RoomId:', roomId);
        console.log('Rounds:', rounds);
        
        // Close modal FIRST
        setShowMultiplayerModal(false);
        
        // Then call parent's onSelectMode
        console.log('=== MODE SELECT: Calling onSelectMode ===');
        onSelectMode('multi', { roomId, rounds });
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
                                    <div className="feature-row">
                                        <span className="check-icon">✓</span>
                                        <span>AI Opponent</span>
                                    </div>
                                    <div className="feature-row">
                                        <span className="check-icon">✓</span>
                                        <span>Multiple Categories</span>
                                    </div>
                                    <div className="feature-row">
                                        <span className="check-icon">✓</span>
                                        <span>Practice Mode</span>
                                    </div>
                                </div>
                                <button 
                                    className="mode-start-btn single-start-btn"
                                    onClick={() => {
                                        console.log('=== Single player button clicked ===');
                                        setShowSinglePlayerModal(true);
                                    }}
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
                                    <div className="feature-row">
                                        <span className="check-icon">✓</span>
                                        <span>Real-Time PvP</span>
                                    </div>
                                    <div className="feature-row">
                                        <span className="check-icon">✓</span>
                                        <span>Custom Rooms</span>
                                    </div>
                                    <div className="feature-row">
                                        <span className="check-icon">✓</span>
                                        <span>Turn-Based</span>
                                    </div>
                                </div>
                                <button 
                                    className="mode-start-btn multi-start-btn"
                                    onClick={() => {
                                        console.log('=== Multiplayer button clicked ===');
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
                onClose={() => {
                    console.log('=== Closing single player modal ===');
                    setShowSinglePlayerModal(false);
                }}
                onStart={handleSinglePlayerStart}
            />
            
            <MultiplayerSetupModal 
                show={showMultiplayerModal}
                onClose={() => {
                    console.log('=== Closing multiplayer modal ===');
                    setShowMultiplayerModal(false);
                }}
                onStart={handleMultiplayerStart}
            />
        </>
    );
};

export default ModeSelectPage;
