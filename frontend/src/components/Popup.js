import React, { useEffect } from 'react';

const Popup = ({ correctLetters, wrongLetters, selectedWord, onRoundComplete }) => {
    let finalMessage = '';
    let finalMessageRevealWord = '';
    let isGameOver = false; // Changed from useState to let

    if (selectedWord) {
        const won = selectedWord.split('').every(letter => correctLetters.includes(letter));
        const lost = wrongLetters.length === 6;

        if (won) {
            finalMessage = '🎉 Victory! You guessed it!';
            isGameOver = true;
        } else if (lost) {
            finalMessage = '😔 Defeat! Better luck next time!';
            finalMessageRevealWord = `The word was: ${selectedWord.toUpperCase()}`;
            isGameOver = true;
        }
    }

    useEffect(() => {
        if (isGameOver) {
            const timer = setTimeout(() => {
                onRoundComplete();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isGameOver, onRoundComplete]);

    if (!finalMessage) return null;

    return (
        <div className={`popup-container ${isGameOver ? 'display' : ''}`}>
            <div className="popup">
                <h2>{finalMessage}</h2>
                {finalMessageRevealWord && <h3>{finalMessageRevealWord}</h3>}
                <p className="popup-info">Next round starting...</p>
            </div>
        </div>
    );
};

export default Popup;