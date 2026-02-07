// ============================================
// FILE 1: SinglePlayerSetupModal.js (FIXED)
// ============================================
import React, { useState, useEffect } from 'react';

const SinglePlayerSetupModal = ({ show, onClose, onStart }) => {
    const [step, setStep] = useState('CHOICE');
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
        if (show && step === 'PICK_CARDS' && categories.length === 0) {
            fetchCategories();
        }
    }, [show, step]);

    // Reset modal state when it closes
    useEffect(() => {
        if (!show) {
            setTimeout(() => {
                setStep('CHOICE');
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
                count: cat.count,
                icon: categoryIcons[cat.name] || '📚'
            })));
        } catch (error) {
            console.error('Error fetching categories:', error);
            setError('Could not load categories. Using defaults.');
            setCategories([
                { name: 'Technology', icon: '💻', count: 0 },
                { name: 'Movies', icon: '🎬', count: 0 },
                { name: 'Countries', icon: '🌍', count: 0 },
                { name: 'Animals', icon: '🦁', count: 0 }
            ]);
        } finally {
            setLoading(false);
        }
    };

    
const handleStart = () => {
    console.log('🎯 === MODAL: START BUTTON CLICKED ===');
    console.log('📁 Selected category:', selectedCategory);
    console.log('🔢 Is custom rounds:', isCustomRounds);
    console.log('🔢 Selected rounds:', selectedRounds);
    console.log('🔢 Custom rounds value:', customRounds);

    // Validation
    if (!selectedCategory || selectedCategory.trim() === '') {
        console.error('❌ No category selected');
        setError('Please select a category');
        return;
    }

    const rounds = isCustomRounds ? parseInt(customRounds) : selectedRounds;
    console.log('🔢 Final rounds:', rounds);
    
    if (isNaN(rounds) || rounds < 1 || rounds > 50) {
        console.error('❌ Invalid rounds:', rounds);
        setError('Please enter valid rounds (1-50)');
        return;
    }

    console.log('✅ Validation passed!');
    console.log('🚀 Calling onStart with:', selectedCategory, rounds);
    
    // Call parent's onStart - parent will close modal
    onStart(selectedCategory, rounds);
    
    console.log('✅ === MODAL: onStart called ===');
};


    const handleBackStep = () => {
        setStep('CHOICE');
        setSelectedCategory('');
        setError('');
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

                {step === 'CHOICE' && (
                    <div className="modal-body">
                        <h3>How do you want to choose your category?</h3>
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
                    <div className="modal-body">
                        <button className="back-step-btn" onClick={handleBackStep}>
                            ← Change Option
                        </button>
                        
                        <h3>{step === 'CUSTOM' ? 'Enter Your Category' : 'Pick a Category'}</h3>
                        
                        {step === 'PICK_CARDS' ? (
                            loading ? (
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
                                            {cat.count > 0 && (
                                                <span className="cat-count">{cat.count} words</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )
                        ) : (
                            <input 
                                className="game-input" 
                                type="text" 
                                placeholder="Enter category (e.g., Countries, Animals)..." 
                                value={selectedCategory}
                                onChange={(e) => {
                                    setSelectedCategory(e.target.value);
                                    setError('');
                                }}
                                autoFocus
                            />
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
                )}
            </div>
        </div>
    );
};

export default SinglePlayerSetupModal;
