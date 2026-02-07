import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { socket } from './socket';
import LandingPage from './pages/LandingPage';
import ModeSelectPage from './pages/ModeSelectPage';
import GamePage from './pages/GamePage';
import ScoreboardPage from './pages/ScoreboardPage';
import Notification from './components/Notification';
import './App.css';

function AppContent() {
    const navigate = useNavigate();
    const [gameMode, setGameMode] = useState(null);
    const [gameState, setGameState] = useState({
        word: '',
        correctLetters: [],
        wrongLetters: [],
        rounds: 0,
        currentRound: 1,
        phase: 'SETTING',
        scores: { p1: 0, p2: 0 }
    });
    const [playable, setPlayable] = useState(true);
    const [showNotif, setShowNotif] = useState(false);
    const [roomId, setRoomId] = useState('');
    const [finalScores, setFinalScores] = useState({ p1: 0, p2: 0 });

    
const startSingleGame = async (category, rounds) => {
    console.log('🎮 === APP.JS: startSingleGame CALLED ===');
    console.log('📁 Category:', category);
    console.log('🔢 Rounds:', rounds);
    
    try {
        const url = `/api/words/random?category=${encodeURIComponent(category)}`;
        console.log('🌐 Fetching from:', url);
        
        const response = await fetch(url);
        console.log('📡 Response status:', response.status);
        
        if (!response.ok) {
            if (response.status === 404) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message || `No words found for category "${category}"`);
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ Word received:', data);
        
        if (!data || !data.text) {
            throw new Error('Invalid response - no word received');
        }
        
        console.log('🎯 Setting game mode to: single');
        setGameMode('single');
        
        console.log('🎯 Setting game state...');
        setGameState({
            word: data.text.toLowerCase(),
            correctLetters: [],
            wrongLetters: [],
            rounds: rounds,
            currentRound: 1,
            phase: 'GUESSING',
            scores: { p1: 0, p2: 0 },
            category: category
        });
        
        console.log('🚀 Navigating to /game');
        navigate('/game');
        
        console.log('✅ === APP.JS: Navigation complete ===');
    } catch (err) { 
        console.error("❌ === APP.JS: ERROR ===", err);
        alert(`⚠️ Error: ${err.message}\n\nMake sure backend is running!`);
    }
};


    const startMultiplayer = (roomIdVal, rounds) => {
        setRoomId(roomIdVal);
        setGameMode('multi');
        socket.connect();
        socket.emit('joinRoom', { roomId: roomIdVal, maxRounds: rounds });
        setGameState(prev => ({
            ...prev,
            rounds: rounds,
            currentRound: 1
        }));
        navigate('/game');
    };

    useEffect(() => {
        socket.on('gameUpdate', (game) => {
            console.log('Game update received:', game);
            setGameState(prev => ({
                ...prev,
                correctLetters: game.correctLetters || [],
                wrongLetters: game.wrongLetters || [],
                word: game.displayWord ? game.displayWord.join('') : '',
                currentRound: game.currentRound,
                phase: game.phase,
                rounds: game.maxRounds,
                scores: game.scores
            }));
            
            if (game.phase === 'SETTING' || game.phase === 'GUESSING') {
                setPlayable(true);
            }
        });

        socket.on('error', (message) => {
            console.error('Socket error:', message);
            triggerNotif();
        });

        return () => {
            socket.off('gameUpdate');
            socket.off('error');
        };
    }, []);

    const handleGuessLetter = (letter) => {
        if (gameMode === 'multi') {
            socket.emit('guessLetter', { roomId, letter });
        } else {
            if (gameState.word.includes(letter)) {
                if (!gameState.correctLetters.includes(letter)) {
                    setGameState(prev => ({...prev, correctLetters: [...prev.correctLetters, letter]}));
                } else { triggerNotif(); }
            } else {
                if (!gameState.wrongLetters.includes(letter)) {
                    setGameState(prev => ({...prev, wrongLetters: [...prev.wrongLetters, letter]}));
                } else { triggerNotif(); }
            }
        }
    };

    const triggerNotif = () => {
        setShowNotif(true);
        setTimeout(() => setShowNotif(false), 2000);
    };

    const handleSetWord = (word, hint) => {
        socket.emit('setWord', { roomId, word: word.toLowerCase(), hint });
    };

    const handleRoundComplete = () => {
        if (gameState.currentRound >= gameState.rounds) {
            setFinalScores(gameState.scores);
            navigate('/scoreboard');
        } else {
            if (gameMode === 'single') {
                fetchNextWord(gameState.category, gameState.currentRound + 1);
            } else {
                setGameState(prev => ({
                    ...prev,
                    currentRound: prev.currentRound + 1,
                    correctLetters: [],
                    wrongLetters: [],
                    phase: 'SETTING'
                }));
            }
        }
    };

    const fetchNextWord = async (category, nextRound) => {
        try {
            const response = await fetch(`/api/words/random?category=${category}`);
            const data = await response.json();
            setGameState(prev => ({
                ...prev,
                word: data.text.toLowerCase(),
                correctLetters: [],
                wrongLetters: [],
                currentRound: nextRound,
                phase: 'GUESSING'
            }));
        } catch (err) { 
            console.error("API Error", err); 
        }
    };

    const handlePlayAgain = () => {
        socket.disconnect();
        setGameMode(null);
        navigate('/mode-select');
    };

    const handleBackToMenu = () => {
        socket.disconnect();
        setGameMode(null);
        navigate('/');
    };

    return (
        <div className="App">
            <Routes>
                <Route path="/" element={<LandingPage onStart={() => navigate('/mode-select')} />} />
                
                <Route path="/mode-select" element={
                    <ModeSelectPage 
                        onSelectMode={(mode, options) => {
                            console.log('Mode selected:', mode, options);
                            if (mode === 'single') {
                                startSingleGame(options.category, options.rounds);
                            } else {
                                startMultiplayer(options.roomId, options.rounds);
                            }
                        }}
                        onBack={() => navigate('/')}
                    />
                } />
                
                <Route path="/game" element={
                    <GamePage
                        gameMode={gameMode}
                        gameState={gameState}
                        playable={playable}
                        showNotif={showNotif}
                        onGuessLetter={handleGuessLetter}
                        onSetWord={handleSetWord}
                        onRoundComplete={handleRoundComplete}
                        onBack={handleBackToMenu}
                    />
                } />
                
                <Route path="/scoreboard" element={
                    <ScoreboardPage
                        gameMode={gameMode}
                        finalScores={finalScores}
                        onPlayAgain={handlePlayAgain}
                        onBackToMenu={handleBackToMenu}
                    />
                } />
            </Routes>

            <Notification showNotification={showNotif} />
        </div>
    );
}

function App() {
    return (
        <Router>
            <AppContent />
        </Router>
    );
}

export default App;