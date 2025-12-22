import React, { useState } from 'react';

const SinglePlayerSetup = ({ onStart }) => {
    const [step, setStep] = useState('CHOICE'); // 'CHOICE', 'PICK_CARDS', 'CUSTOM'
    const [selectedCategory, setSelectedCategory] = useState('');
    const [rounds, setRounds] = useState(3);

    const categories = [
        { name: 'Technology', icon: '💻' },
        { name: 'Movies', icon: '🎬' },
        { name: 'Countries', icon: '🌍' },
        { name: 'Animals', icon: '🦁' },
        { name: 'Science', icon: '🧪' }
    ];

    const handleFinalStart = () => {
        if (selectedCategory) {
            onStart(selectedCategory, rounds);
        }
    };

    return (
        <div className="setup-card">
            {step === 'CHOICE' && (
                <div className="choice-view">
                    <h2>Solo Arena</h2>
                    <p>How do you want to choose your category?</p>
                    <button className="mode-btn" onClick={() => setStep('PICK_CARDS')}>Select from Arena Categories</button>
                    <button className="mode-btn outline" onClick={() => setStep('CUSTOM')}>Give My Own Category</button>
                </div>
            )}

            {(step === 'PICK_CARDS' || step === 'CUSTOM') && (
                <div className="setup-flow">
                    <h3>{step === 'CUSTOM' ? 'Enter Category' : 'Pick a Category'}</h3>
                    
                    {step === 'PICK_CARDS' ? (
                        <div className="category-grid">
                            {categories.map((cat) => (
                                <div 
                                    key={cat.name} 
                                    className={`cat-card ${selectedCategory === cat.name ? 'active' : ''}`}
                                    onClick={() => setSelectedCategory(cat.name)}
                                >
                                    <span className="cat-icon">{cat.icon}</span>
                                    <h4>{cat.name}</h4>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <input 
                            className="game-input" 
                            placeholder="e.g. Marvel Characters" 
                            onChange={(e) => setSelectedCategory(e.target.value)}
                        />
                    )}

                    <div className="round-section">
                        <label>Rounds (1-10):</label>
                        <input 
                            type="number" min="1" max="10" 
                            value={rounds} 
                            onChange={(e) => setRounds(e.target.value)} 
                        />
                    </div>

                    <div className="setup-actions">
                        <button className="back-link" onClick={() => setStep('CHOICE')}>← Back</button>
                        <button className="primary-btn" onClick={handleFinalStart} disabled={!selectedCategory}>
                            LAUNCH GAME
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SinglePlayerSetup;