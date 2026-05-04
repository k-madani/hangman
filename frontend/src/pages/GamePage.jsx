import React, { useEffect, useState, useCallback } from 'react';
import Figure from '../components/Figure';
import WrongLetters from '../components/WrongLetters';
import Word from '../components/Word';
import Popup from '../components/Popup';
import Notification from '../components/Notification';
import GameSetupModal from '../components/GameSetupModal';
import { socket } from '../socket';

const GamePage = ({
    gameMode,
    gameState,
    roomCode,
    playable,
    showNotif,
    onGuessLetter,
    onSetWord,
    onRoundComplete,
    onBack
}) => {
    const [showSetupModal, setShowSetupModal] = useState(false);
    const [codeCopied, setCodeCopied] = useState(false);

    const isMyTurnToSet = gameMode === 'multi' && socket.id === gameState.setterSocketId;

    useEffect(() => {
        if (gameMode === 'multi' && gameState.phase === 'SETTING_WORD' && isMyTurnToSet) {
            setShowSetupModal(true);
        } else {
            setShowSetupModal(false);
        }
    }, [gameState.phase, gameMode, isMyTurnToSet]);

    const handleSetWord = (word, hint) => {
        onSetWord(word, hint);
        setShowSetupModal(false);
    };

    const handleGuessKey = useCallback((e) => {
        const { key, keyCode } = e;
        // Only guesser can type — block setter from guessing their own word
        if (playable && gameState.phase === 'GUESSING' && !isMyTurnToSet && keyCode >= 65 && keyCode <= 90) {
            onGuessLetter(key.toLowerCase());
        }
    }, [playable, gameState.phase, isMyTurnToSet, onGuessLetter]);

    useEffect(() => {
        window.addEventListener('keydown', handleGuessKey);
        return () => window.removeEventListener('keydown', handleGuessKey);
    }, [handleGuessKey]);

    const copyRoomCode = () => {
        navigator.clipboard.writeText(roomCode);
        setCodeCopied(true);
        setTimeout(() => setCodeCopied(false), 2000);
    };

    // Setter always sees full hint. Guesser gets progressive reveal.
    const getProgressiveHint = () => {
        const wrongCount = gameState.wrongLetters.length;
        const hint = gameState.hint || '';
        if (!hint || hint.trim() === '' || hint === 'No hint provided') return null;
        if (isMyTurnToSet) return hint; // setter always sees full hint
        if (wrongCount < 2) return null;
        if (wrongCount < 4) return hint.substring(0, Math.ceil(hint.length * 0.3)) + '...';
        if (wrongCount < 6) return hint.substring(0, Math.ceil(hint.length * 0.7)) + '...';
        return hint;
    };

    const currentHint = getProgressiveHint();
    const wrongCount = gameState.wrongLetters.length;
    const hasHint = gameState.hint && gameState.hint.trim() !== '' && gameState.hint !== 'No hint provided';

    // ── WAITING FOR PLAYER 2 ──────────────────────────────────────
    if (gameMode === 'multi' && gameState.phase === 'WAITING_FOR_PLAYERS') {
        return (
            <div className="game-container">
                <div className="game-corner-logo" onClick={onBack}>WORD ARENA</div>
                <div className="waiting-room">
                    <div className="waiting-spinner">⏳</div>
                    <h2>Waiting for opponent...</h2>
                    <p>Share this room code with your friend:</p>
                    <div className="room-code-display">
                        <span className="room-code-text">{roomCode}</span>
                        <button className="copy-btn" onClick={copyRoomCode}>
                            {codeCopied ? '✓ Copied' : 'Copy'}
                        </button>
                    </div>
                    <p className="waiting-sub">Game starts automatically when they join.</p>
                </div>
            </div>
        );
    }

    // ── MATCH STARTING (both players, 2.5s) ───────────────────────
    if (gameMode === 'multi' && gameState.phase === 'MATCH_STARTING') {
        return (
            <div className="game-container">
                <div className="game-corner-logo" onClick={onBack}>WORD ARENA</div>
                <div className="waiting-room">
                    <div className="waiting-spinner">⚔️</div>
                    <h2>Match is starting...</h2>
                    <p>{gameState.rounds} round{gameState.rounds !== 1 ? 's' : ''} · May the best guesser win</p>
                </div>
            </div>
        );
    }

    // ── GUESSER WAITING WHILE OPPONENT SETS WORD ─────────────────
    if (gameMode === 'multi' && gameState.phase === 'SETTING_WORD' && !isMyTurnToSet) {
        return (
            <div className="game-container">
                <div className="game-corner-logo" onClick={onBack}>WORD ARENA</div>
                <div className="game-info-panel">
                    <div className="info-item">
                        <span className="info-label">Round</span>
                        <span className="info-value">{gameState.currentRound} / {gameState.rounds}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">P1 Score</span>
                        <span className="info-value">{gameState.scores.p1}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">P2 Score</span>
                        <span className="info-value">{gameState.scores.p2}</span>
                    </div>
                </div>
                <div className="waiting-room">
                    <div className="waiting-spinner">🤔</div>
                    <h2>Opponent is thinking of a word...</h2>
                    <p>Get ready to guess!</p>
                </div>
            </div>
        );
    }

    // ── ROLE BANNER ───────────────────────────────────────────────
    const getRoleBanner = () => {
        if (gameMode !== 'multi' || gameState.phase !== 'GUESSING') return null;
        if (isMyTurnToSet) {
            return (
                <div className="role-banner setter-banner">
                    👀 You set: <strong>{gameState.actualWord?.toUpperCase()}</strong>
                    {gameState.hint && (
                        <span className="setter-hint"> · Hint: {gameState.hint}</span>
                    )}
                </div>
            );
        }
        return <div className="role-banner guesser-banner">🎯 Your turn — guess the word!</div>;
    };

    // ── MAIN GAME BOARD ───────────────────────────────────────────
    return (
        <div className="game-container">
            <div className="game-corner-logo" onClick={onBack}>
                WORD ARENA
            </div>

            <div className="game-info-panel">
                <div className="info-item">
                    <span className="info-label">Round</span>
                    <span className="info-value">{gameState.currentRound} / {gameState.rounds}</span>
                </div>

                {gameMode === 'single' && (
                    <div className="info-item">
                        <span className="info-label">Score</span>
                        <span className="info-value">{gameState.scores.p1}</span>
                    </div>
                )}

                {gameMode === 'multi' && (
                    <>
                        <div className="info-item">
                            <span className="info-label">P1 Score</span>
                            <span className="info-value">{gameState.scores.p1}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">P2 Score</span>
                            <span className="info-value">{gameState.scores.p2}</span>
                        </div>
                    </>
                )}

                <div className="info-item category-item">
                    <span className="info-label">📁 Category</span>
                    <span className="info-hint">{gameState.category || 'Custom'}</span>
                </div>

                {hasHint && (
                    currentHint ? (
                        <div className="info-item hint-item">
                            <span className="info-label">
                                💡 Hint {isMyTurnToSet ? '(Full)' : wrongCount < 4 ? '(Partial)' : wrongCount < 6 ? '(More)' : '(Full)'}
                            </span>
                            <span className="info-hint-text">{currentHint}</span>
                        </div>
                    ) : (
                        <div className="info-item hint-locked">
                            <span className="info-label">🔒 Hint Locked</span>
                            <span className="hint-locked-text">
                                {2 - wrongCount} more wrong {2 - wrongCount === 1 ? 'guess' : 'guesses'}
                            </span>
                        </div>
                    )
                )}
            </div>

            {gameMode === 'multi' && gameState.phase === 'SETTING_WORD' && isMyTurnToSet ? (
                <GameSetupModal onSetWord={handleSetWord} show={showSetupModal} />
            ) : (
                <div className="game-content">
                    {getRoleBanner()}
                    <Figure wrongLetters={gameState.wrongLetters} />
                    <WrongLetters wrongLetters={gameState.wrongLetters} />
                    <Word selectedWord={gameState.word} correctLetters={gameState.correctLetters} />
                </div>
            )}

            <Popup
                correctLetters={gameState.correctLetters}
                wrongLetters={gameState.wrongLetters}
                selectedWord={gameState.word}
                actualWord={gameState.actualWord}
                currentRound={gameState.currentRound}
                totalRounds={gameState.rounds}
                onRoundComplete={onRoundComplete}
            />
            <Notification showNotification={showNotif} />
        </div>
    );
};

export default GamePage;