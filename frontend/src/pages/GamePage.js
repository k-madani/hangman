import React, { useEffect, useState, useCallback } from 'react';
import Figure from '../components/Figure';
import WrongLetters from '../components/WrongLetters';
import Word from '../components/Word';
import Popup from '../components/Popup';
import Notification from '../components/Notification';
import GameSetupModal from '../components/GameSetupModal';

const GamePage = ({ 
    gameMode, 
    gameState, 
    playable, 
    showNotif, 
    onGuessLetter,
    onSetWord,
    onRoundComplete,
    onBack 
}) => {
    const [showSetupModal, setShowSetupModal] = useState(false);

    useEffect(() => {
        if (gameMode === 'multi' && gameState.phase === 'SETTING') {
            setShowSetupModal(true);
        } else {
            setShowSetupModal(false);
        }
    }, [gameState.phase, gameMode]);

    const handleSetWord = (word, hint) => {
        onSetWord(word, hint);
        setShowSetupModal(false);
    };

    const handleGuessKey = useCallback((e) => {
        const { key, keyCode } = e;
        if (playable && gameState.phase === 'GUESSING' && keyCode >= 65 && keyCode <= 90) {
            const letter = key.toLowerCase();
            onGuessLetter(letter);
        }
    }, [playable, gameState.phase, onGuessLetter]);

    useEffect(() => {
        window.addEventListener('keydown', handleGuessKey);
        return () => window.removeEventListener('keydown', handleGuessKey);
    }, [handleGuessKey]);

    return (
        <div className="game-container">
            <div className="game-header">
                <button className="back-btn" onClick={onBack}>← Menu</button>
                <h2 className="game-heading">ROUND {gameState.currentRound} / {gameState.rounds}</h2>
                {gameMode === 'multi' && (
                    <div className="score-board">
                        <span className="score">P1: {gameState.scores.p1}</span>
                        <span className="score">P2: {gameState.scores.p2}</span>
                    </div>
                )}
            </div>
            
            {gameState.phase === 'SETTING' && gameMode === 'multi' ? (
                <GameSetupModal 
                    onSetWord={handleSetWord} 
                    show={showSetupModal}
                />
            ) : (
                <div className="game-content">
                    <Figure wrongLetters={gameState.wrongLetters} />
                    <WrongLetters wrongLetters={gameState.wrongLetters} />
                    <Word selectedWord={gameState.word} correctLetters={gameState.correctLetters} />
                </div>
            )}
            
            <Popup 
                correctLetters={gameState.correctLetters} 
                wrongLetters={gameState.wrongLetters} 
                selectedWord={gameState.word} 
                onRoundComplete={onRoundComplete}
            />
            <Notification showNotification={showNotif} />
        </div>
    );
};

export default GamePage;