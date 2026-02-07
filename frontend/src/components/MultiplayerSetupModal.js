import React, { useState } from 'react';

const MultiplayerSetupModal = ({ show, onClose, onStart }) => {
    const [selectedRoomId, setSelectedRoomId] = useState('');
    const [selectedRounds, setSelectedRounds] = useState(3);
    const [customRounds, setCustomRounds] = useState('');
    const [isCustomRounds, setIsCustomRounds] = useState(false);

    const handleStart = () => {
        if (selectedRoomId.trim()) {
            const rounds = isCustomRounds ? parseInt(customRounds) : selectedRounds;
            if (rounds > 0 && rounds <= 50) {
                onStart(selectedRoomId, rounds);
                // Reset state
                setSelectedRoomId('');
                setSelectedRounds(3);
                setCustomRounds('');
                setIsCustomRounds(false);
            }
        }
    };

    const handleRoundOptionClick = (value) => {
        if (value === 'custom') {
            setIsCustomRounds(true);
            setSelectedRounds(0);
        } else {
            setIsCustomRounds(false);
            setSelectedRounds(value);
            setCustomRounds('');
        }
    };

    const isStartDisabled = () => {
        if (!selectedRoomId.trim()) return true;
        if (isCustomRounds) {
            const rounds = parseInt(customRounds);
            return !customRounds || rounds < 1 || rounds > 50;
        }
        return false;
    };

    if (!show) return null;

    return (
        <div className="modal-overlay" onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
        }}>
            <div className="modal-content setup-modal">
                <div className="modal-header">
                    <h2>⚔️ Multiplayer Setup</h2>
                    <button className="modal-close-btn" onClick={onClose}>✕</button>
                </div>

                <div className="modal-body">
                    <h3>Configure Your Game</h3>
                    
                    <div className="form-group">
                        <label>Room Name:</label>
                        <input 
                            type="text" 
                            className="game-input" 
                            placeholder="Enter room name (e.g., Arena1)" 
                            value={selectedRoomId}
                            onChange={(e) => setSelectedRoomId(e.target.value)}
                            autoFocus
                        />
                    </div>

                    <div className="round-section">
                        <label>Number of Rounds:</label>
                        <div className="round-selector">
                            {[1, 3, 5, 10].map(num => (
                                <button
                                    key={num}
                                    className={`round-option ${!isCustomRounds && selectedRounds === num ? 'active' : ''}`}
                                    onClick={() => handleRoundOptionClick(num)}
                                >
                                    {num}
                                </button>
                            ))}
                            <button
                                className={`round-option ${isCustomRounds ? 'active' : ''}`}
                                onClick={() => handleRoundOptionClick('custom')}
                            >
                                Custom
                            </button>
                        </div>
                        {isCustomRounds && (
                            <input 
                                className="custom-rounds-input" 
                                type="number" 
                                placeholder="Enter rounds (1-50)" 
                                min="1"
                                max="50"
                                value={customRounds}
                                onChange={(e) => setCustomRounds(e.target.value)}
                                autoFocus
                            />
                        )}
                    </div>

                    <button 
                        className="primary-btn modal-btn" 
                        onClick={handleStart}
                        disabled={isStartDisabled()}
                    >
                        Start Playing
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MultiplayerSetupModal;