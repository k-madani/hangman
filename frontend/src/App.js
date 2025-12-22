import React, { useState, useEffect } from 'react';
import { socket } from './socket';
import Dashboard from './components/Dashboard';
import Lobby from './components/Lobby';
import SinglePlayerSetup from './components/SinglePlayerSetup';
import './App.css';

function App() {
    const [view, setView] = useState('INTRO');
    const [gameMode, setGameMode] = useState(null); 
    const [gameState, setGameState] = useState(null);

    useEffect(() => {
        socket.on('gameUpdate', (data) => {
            setGameState(data);
            if (view !== 'GAME' && data.phase !== 'WAITING_FOR_PLAYERS') {
                setView('GAME');
            }
        });
        return () => socket.off('gameUpdate');
    }, [view]);

    const startSingleGame = async (category, rounds) => {
        try {
            // Updated fetch to use your category selection
            const response = await fetch(`http://localhost:5000/api/words/random?category=${category}`);
            const data = await response.json();
            
            setGameState({
                phase: 'GUESSING',
                currentRound: 1,
                maxRounds: rounds,
                displayWord: Array(data.word.length).fill(""),
                hint: data.hint,
                wrongLetters: [],
                correctLetters: [],
                scores: { p1: 0, p2: 0 },
                targetWord: data.word.toLowerCase()
            });
            setView('GAME');
        } catch (err) {
            console.error("Solo game error:", err);
            alert("Error fetching word. Make sure backend is running!");
        }
    };

    return (
        <div className="App">
            {view === 'INTRO' && <Dashboard onStart={() => setView('MODE_SELECT')} />}

            {view === 'MODE_SELECT' && (
                <div className="full-center">
                    <h1 className="logo-text">WORD ARENA</h1>
                    <div className="mode-cards">
                        <div className="m-card" onClick={() => {setGameMode('single'); setView('SETUP');}}>
                            <h2>SINGLE PLAYER</h2>
                            <p>VS CPU</p>
                        </div>
                        <div className="m-card" onClick={() => {setGameMode('multi'); setView('SETUP');}}>
                            <h2>MULTIPLAYER</h2>
                            <p>VS FRIEND</p>
                        </div>
                    </div>
                </div>
            )}

            {view === 'SETUP' && (
                <div className="full-center">
                    {gameMode === 'multi' ? (
                        <Lobby onJoin={(r, rd) => { socket.connect(); socket.emit('joinRoom', {roomId: r, maxRounds: rd}); }} />
                    ) : (
                        <SinglePlayerSetup onStart={startSingleGame} />
                    )}
                </div>
            )}

            {view === 'GAME' && gameState && (
                <div className="game-arena">
                    {/* Game UI continues here */}
                    <h2>Category: {gameState.hint ? "Solo Battle" : "PvP Challenge"}</h2>
                    <div className="word-box">
                        {gameState.displayWord.map((l, i) => <span key={i} className="letter-line">{l || '_'}</span>)}
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;