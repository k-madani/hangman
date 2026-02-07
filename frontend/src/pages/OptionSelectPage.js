import React, { useState } from 'react';

const OptionSelectPage = ({ gameMode, onProceed, onBack }) => {
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedRounds, setSelectedRounds] = useState(3);
    const [selectedRoomId, setSelectedRoomId] = useState('');
    const [step, setStep] = useState('CHOICE'); // 'CHOICE', 'PICK_CARDS', 'CUSTOM'

    const categories = [
        { name: 'Technology', icon: '💻' },
        { name: 'Movies', icon: '🎬' },
        { name: 'Countries', icon: '🌍' },
        { name: 'Animals', icon: '🦁' },
        { name: 'Science', icon: '🧪' }
    ];

    const handleProceed = () => {
        if (gameMode === 'single' && selectedCategory) {
            onProceed({ category: selectedCategory, rounds: selectedRounds });
        } else if (gameMode === 'multi' && selectedRoomId.trim()) {
            onProceed({ roomId: selectedRoomId, rounds: selectedRounds });
        }
    };

    if (gameMode === 'single') {
        return (
            <div className="full-center">
                <div className="page-header">
                    <button className="back-btn" onClick={onBack}>← Back</button>
                    <h1 className="logo-text">Solo Arena Setup</h1>
                </div>

                {step === 'CHOICE' && (
                    <div className="setup-card">
                        <h2>How do you want to choose your category?</h2>
                        <div className="choice-buttons">
                            <button 
                                className="mode-btn" 
                                onClick={() => setStep('PICK_CARDS')}
                            >
                                Select from Arena Categories
                            </button>
                            <button 
                                className="mode-btn outline" 
                                onClick={() => setStep('CUSTOM')}
                            >
                                Give My Own Category
                            </button>
                        </div>
                    </div>
                )}

                {(step === 'PICK_CARDS' || step === 'CUSTOM') && (
                    <div className="setup-card">
                        <button className="back-btn-small" onClick={() => setStep('CHOICE')}>← Change Option</button>
                        
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
                                type="text" 
                                placeholder="Enter category..." 
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                autoFocus
                            />
                        )}

                        <div className="round-section">
                            <label>Number of Rounds:</label>
                            <div className="round-selector">
                                {[1, 3, 5, 10].map(num => (
                                    <button
                                        key={num}
                                        className={`round-option ${selectedRounds === num ? 'active' : ''}`}
                                        onClick={() => setSelectedRounds(num)}
                                    >
                                        {num}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button 
                            className="primary-btn" 
                            onClick={handleProceed}
                            disabled={!selectedCategory}
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        );
    } else {
        // Multiplayer
        return (
            <div className="full-center">
                <div className="page-header">
                    <button className="back-btn" onClick={onBack}>← Back</button>
                    <h1 className="logo-text">Multiplayer Setup</h1>
                </div>

                <div className="setup-card">
                    <h3>Configure Game</h3>
                    
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
                                    className={`round-option ${selectedRounds === num ? 'active' : ''}`}
                                    onClick={() => setSelectedRounds(num)}
                                >
                                    {num}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button 
                        className="primary-btn" 
                        onClick={handleProceed}
                        disabled={!selectedRoomId.trim()}
                    >
                        Next
                    </button>
                </div>
            </div>
        );
    }
};

export default OptionSelectPage;
