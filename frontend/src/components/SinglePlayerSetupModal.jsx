import React, { useState, useEffect } from 'react';

const SinglePlayerSetupModal = ({ show, onClose, onStart }) => {
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedRounds, setSelectedRounds] = useState(3);
    const [customRounds, setCustomRounds] = useState('');
    const [isCustomRounds, setIsCustomRounds] = useState(false);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const categoryIcons = {
        'Technology': '💻',
        'Movies': '🎬',
        'Countries': '🌍',
        'Animals': '🦁',
        'Science': '🧪',
        'Sports': '⚽',
        'Food': '🍕',
        'Music': '🎵'
    };

    useEffect(() => {
        if (show && categories.length === 0) {
            fetchCategories();
        }
    }, [show]);

    useEffect(() => {
        if (!show) {
            setTimeout(() => {
                setSelectedCategory('');
                setSelectedRounds(3);
                setCustomRounds('');
                setIsCustomRounds(false);
                setError('');
            }, 300);
        }
    }, [show]);

    const fetchCategories = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch('/api/words/categories');
            if (!response.ok) throw new Error('Failed to fetch categories');
            
            const data = await response.json();
            console.log('Categories fetched:', data);
            
            setCategories(data.map(cat => ({
                name: cat.name,
                icon: categoryIcons[cat.name] || '📚'
            })));
        } catch (error) {
            console.error('Error fetching categories:', error);
            setError('Could not load categories. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleStart = () => {
        console.log('🎯 === MODAL: START BUTTON CLICKED ===');
        console.log('Selected category:', selectedCategory);

        if (!selectedCategory || selectedCategory.trim() === '') {
            setError('Please select a category');
            return;
        }

        const rounds = isCustomRounds ? parseInt(customRounds) : selectedRounds;
        
        if (isNaN(rounds) || rounds < 1 || rounds > 50) {
            setError('Please enter valid rounds (1-50)');
            return;
        }

        console.log('✅ Calling onStart with:', selectedCategory, rounds);
        onStart(selectedCategory, rounds);
    };

    const handleRoundOptionClick = (value) => {
        setError('');
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
        if (!selectedCategory) return true;
        if (isCustomRounds) {
            const rounds = parseInt(customRounds);
            return !customRounds || isNaN(rounds) || rounds < 1 || rounds > 50;
        }
        return false;
    };

    if (!show) return null;

    return (
        <div className="modal-overlay" onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
        }}>
            <div className="modal-content setup-modal large-modal">
                <div className="modal-header">
                    <h2>⚙️ Solo Arena Setup</h2>
                    <button className="modal-close-btn" onClick={onClose}>✕</button>
                </div>

                {error && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.2)',
                        border: '2px solid #ef4444',
                        padding: '12px',
                        borderRadius: '8px',
                        color: '#fca5a5',
                        marginBottom: '15px',
                        textAlign: 'center',
                        fontWeight: '600'
                    }}>
                        ⚠️ {error}
                    </div>
                )}

                <div className="modal-body">
                    <h3>Pick a Category</h3>
                    
                    {loading ? (
                        <div className="loading-categories">Loading categories...</div>
                    ) : (
                        <div className="category-grid">
                            {categories.map((cat) => (
                                <div 
                                    key={cat.name} 
                                    className={`cat-card ${selectedCategory === cat.name ? 'active' : ''}`}
                                    onClick={() => {
                                        setSelectedCategory(cat.name);
                                        setError('');
                                    }}
                                >
                                    <span className="cat-icon">{cat.icon}</span>
                                    <h4>{cat.name}</h4>
                                </div>
                            ))}
                        </div>
                    )}

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

export default SinglePlayerSetupModal;