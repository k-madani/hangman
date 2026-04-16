import React, { useEffect, useState } from 'react';

// FIX: Accept actualWord prop — backend reveals the real word on loss/win in multiplayer.
// In single player, selectedWord already IS the real word so actualWord is unused there.
const Popup = ({ correctLetters, wrongLetters, selectedWord, actualWord, onRoundComplete, currentRound, totalRounds }) => {
    const [countdown, setCountdown] = useState(3);

    let finalMessage = '';
    let finalMessageRevealWord = '';
    let isGameOver = false;
    let isFinalRound = currentRound === totalRounds;

    if (selectedWord) {
        const won = selectedWord.split('').every(letter => correctLetters.includes(letter));
        const lost = wrongLetters.length === 6;

        if (won) {
            if (isFinalRound) {
                finalMessage = '🎉 Final Round Complete!';
                finalMessageRevealWord = 'You guessed it correctly!';
            } else {
                finalMessage = '🎉 Victory! You guessed it!';
            }
            isGameOver = true;
        } else if (lost) {
            // FIX: Use actualWord (from backend) when available so multiplayer shows
            // the real word, not the masked display string like "_ _ _ _"
            const revealedWord = actualWord || selectedWord;
            if (isFinalRound) {
                finalMessage = '😔 Final Round Over!';
                finalMessageRevealWord = `The word was: ${revealedWord.toUpperCase()}`;
            } else {
                finalMessage = '😔 Defeat! Better luck next time!';
                finalMessageRevealWord = `The word was: ${revealedWord.toUpperCase()}`;
            }
            isGameOver = true;
        }
    }

    useEffect(() => {
        if (isGameOver) {
            setCountdown(3);

            const countdownInterval = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(countdownInterval);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            const timer = setTimeout(() => {
                onRoundComplete();
            }, 3000);

            return () => {
                clearTimeout(timer);
                clearInterval(countdownInterval);
            };
        }
    }, [isGameOver, onRoundComplete]);

    if (!finalMessage) return null;

    return (
        <div className={`popup-container ${isGameOver ? 'display' : ''}`}>
            <div className="popup">
                <h2>{finalMessage}</h2>
                {finalMessageRevealWord && <h3>{finalMessageRevealWord}</h3>}
                <p className="popup-info">
                    {isFinalRound
                        ? `Calculating final score... ${countdown}`
                        : `Next round starting in ${countdown}...`
                    }
                </p>
            </div>
        </div>
    );
};

export default Popup;