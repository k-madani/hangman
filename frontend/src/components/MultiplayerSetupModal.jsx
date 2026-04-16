import React, { useState } from 'react';

// Two tabs: P1 creates a room (sets rounds), P2 joins with a code.
// This removes the bug where both players had to independently agree on rounds.
const MultiplayerSetupModal = ({ show, onClose, onStart }) => {
    const [tab, setTab] = useState('create'); // 'create' | 'join'

    // Create tab state
    const [selectedRounds, setSelectedRounds] = useState(3);
    const [customRounds, setCustomRounds] = useState('');
    const [isCustomRounds, setIsCustomRounds] = useState(false);

    // Join tab state
    const [roomCode, setRoomCode] = useState('');

    const handleRoundClick = (value) => {
        if (value === 'custom') {
            setIsCustomRounds(true);
            setSelectedRounds(0);
        } else {
            setIsCustomRounds(false);
            setSelectedRounds(value);
            setCustomRounds('');
        }
    };

    const handleCreate = () => {
        const rounds = isCustomRounds ? parseInt(customRounds) : selectedRounds;
        if (rounds > 0 && rounds <= 10) {
            onStart('create', { rounds });
            resetState();
        }
    };

    const handleJoin = () => {
        if (roomCode.trim().length > 0) {
            onStart('join', { roomId: roomCode.trim().toUpperCase() });
            resetState();
        }
    };

    const resetState = () => {
        setTab('create');
        setSelectedRounds(3);
        setCustomRounds('');
        setIsCustomRounds(false);
        setRoomCode('');
    };

    const isCreateDisabled = () => {
        if (isCustomRounds) {
            const r = parseInt(customRounds);
            return !customRounds || isNaN(r) || r < 1 || r > 10;
        }
        return selectedRounds < 1;
    };

    if (!show) return null;

    return (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="modal-content setup-modal">
                <div className="modal-header">
                    <h2>⚔️ Multiplayer</h2>
                    <button className="modal-close-btn" onClick={onClose}>✕</button>
                </div>

                {/* Tab switcher */}
                <div className="modal-tabs">
                    <button
                        className={`modal-tab ${tab === 'create' ? 'active' : ''}`}
                        onClick={() => setTab('create')}
                    >
                        Create Room
                    </button>
                    <button
                        className={`modal-tab ${tab === 'join' ? 'active' : ''}`}
                        onClick={() => setTab('join')}
                    >
                        Join Room
                    </button>
                </div>

                <div className="modal-body">
                    {tab === 'create' && (
                        <>
                            <p className="modal-description">
                                Set up the match. You'll get a room code to share with your opponent.
                            </p>

                            <div className="round-section">
                                <label>Number of Rounds:</label>
                                <div className="round-selector">
                                    {[1, 3, 5, 10].map(num => (
                                        <button
                                            key={num}
                                            className={`round-option ${!isCustomRounds && selectedRounds === num ? 'active' : ''}`}
                                            onClick={() => handleRoundClick(num)}
                                        >
                                            {num}
                                        </button>
                                    ))}
                                    <button
                                        className={`round-option ${isCustomRounds ? 'active' : ''}`}
                                        onClick={() => handleRoundClick('custom')}
                                    >
                                        Custom
                                    </button>
                                </div>
                                {isCustomRounds && (
                                    <input
                                        className="custom-rounds-input"
                                        type="number"
                                        placeholder="Enter rounds (1-10)"
                                        min="1"
                                        max="10"
                                        value={customRounds}
                                        onChange={(e) => setCustomRounds(e.target.value)}
                                        autoFocus
                                    />
                                )}
                            </div>

                            <button
                                className="primary-btn modal-btn"
                                onClick={handleCreate}
                                disabled={isCreateDisabled()}
                            >
                                Create Room →
                            </button>
                        </>
                    )}

                    {tab === 'join' && (
                        <>
                            <p className="modal-description">
                                Enter the room code your opponent shared with you.
                            </p>

                            <div className="form-group">
                                <label>Room Code:</label>
                                <input
                                    type="text"
                                    className="game-input room-code-input"
                                    placeholder="e.g. X4KR2A"
                                    value={roomCode}
                                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                                    maxLength={6}
                                    autoFocus
                                    onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                                />
                            </div>

                            <button
                                className="primary-btn modal-btn"
                                onClick={handleJoin}
                                disabled={!roomCode.trim()}
                            >
                                Join Arena →
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MultiplayerSetupModal;