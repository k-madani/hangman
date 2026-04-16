import React, { useState } from 'react';

const GameSetupModal = ({ onSetWord, show }) => {
    const [word, setWord] = useState('');
    const [hint, setHint] = useState('');

    const handleSubmit = () => {
        if (word.trim()) {
            onSetWord(word, hint);
            setWord('');
            setHint('');
        }
    };

    if (!show) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content setup-modal">
                <h3>🔐 Set the word for your opponent</h3>
                <p>Choose a word and optionally provide a hint</p>
                
                <div className="modal-form">
                    <div className="form-group">
                        <label>Secret Word *</label>
                        <input 
                            type="password" 
                            className="game-input" 
                            placeholder="Enter secret word..." 
                            value={word}
                            onChange={(e) => setWord(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label>Hint (optional)</label>
                        <input 
                            type="text" 
                            className="game-input" 
                            placeholder="Provide a hint..." 
                            value={hint}
                            onChange={(e) => setHint(e.target.value)}
                        />
                    </div>

                    <button 
                        className="primary-btn modal-btn" 
                        onClick={handleSubmit}
                        disabled={!word.trim()}
                    >
                        Start Playing
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GameSetupModal;
