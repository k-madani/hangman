import React, { useState, useEffect } from 'react';
import { socket } from './socket';
import Dashboard from './Dashboard';
import Lobby from './Lobby';
import SinglePlayerSetup from './SinglePlayerSetup';
import Figure from './Figure'; // Classic hangman figure
import WrongLetters from './WrongLetters';
import Word from './Word';
import Popup from './Popup';
import Notification from './Notification';
import './App.css';

function App() {
    const [view, setView] = useState('INTRO');
    const [gameMode, setGameMode] = useState(null); 
    const [gameState, setGameState] = useState(null);
    const [playable, setPlayable] = useState(true);

    // This handles the "Hangman" logic for Solo Mode
    const handleKeydown = (event) => {
        const { key, keyCode } = event;
        if (view === 'GAME' && playable && keyCode >= 65 && keyCode <= 90) {
            const letter = key.toLowerCase();
            // Logic to update gameState.correctLetters or wrongLetters would go here
        }
    };

    useEffect(() => {
        window.addEventListener('keydown', handleKeydown);
        return () => window.removeEventListener('keydown', handleKeydown);
    }, [view, playable]);

    return (
        <div className="App">
            {view === 'INTRO' && <Dashboard onStart={() => setView('MODE_SELECT')} />}

            {view === 'MODE_SELECT' && (
                <div className="full-center">
                    <h1 className="arena-logo">WORD ARENA</h1>
                    <div className="mode-selection-grid">
                        <div className="mode-card" onClick={() => {setGameMode('single'); setView('SETUP');}}>
                            <h2>SOLO CHALLENGE</h2>
                            <p>Test your wits against the Arena</p>
                        </div>
                        <div className="mode-card" onClick={() => {setGameMode('multi'); setView('SETUP');}}>
                            <h2>PVP BATTLE</h2>
                            <p>Duel a friend in real-time</p>
                        </div>
                    </div>
                </div>
            )}

            {view === 'SETUP' && (
                <div className="full-center">
                    {gameMode === 'multi' ? <Lobby onJoin={() => {}} /> : <SinglePlayerSetup onStart={() => setView('GAME')} />}
                </div>
            )}

            {view === 'GAME' && (
                <div className="game-container">
                    <h2 className="game-heading">WORD ARENA: {gameMode.toUpperCase()}</h2>
                    <div className="game-content">
                        <Figure wrongLetters={[]} /> {/* The Hangman element */}
                        <WrongLetters wrongLetters={[]} />
                        <Word selectedWord="ARENA" correctLetters={['a', 'r']} />
                    </div>
                    {/* Popups and Notifications here */}
                </div>
            )}
        </div>
    );
}

export default App;