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
    const [roomId, setRoomId] = useState('');
    const [joinError, setJoinError] = useState('');
    const [finalScores, setFinalScores] = useState({ p1: 0, p2: 0 });
    const [showNotif, setShowNotif] = useState(false);
    const [playable, setPlayable] = useState(true);

    const [gameState, setGameState] = useState({
        word: '',
        hint: '',
        correctLetters: [],
        wrongLetters: [],
        rounds: 0,
        currentRound: 1,
        phase: 'IDLE',
        scores: { p1: 0, p2: 0 },
        setterSocketId: null,
        actualWord: null,
        status: 'playing',
        category: ''
    });

    // ── SINGLE PLAYER ─────────────────────────────────────────────

    const startSingleGame = async (category, rounds) => {
        try {
            const response = await fetch(`/api/words/random?category=${encodeURIComponent(category)}`);
            if (!response.ok) throw new Error(`No words found for category "${category}"`);

            const data = await response.json();
            if (!data || !data.text) throw new Error('Invalid response — no word received');

            setGameMode('single');
            setGameState({
                word: data.text.toLowerCase(),
                hint: data.hint || '',
                correctLetters: [],
                wrongLetters: [],
                rounds,
                currentRound: 1,
                phase: 'GUESSING',
                scores: { p1: 0, p2: 0 },
                setterSocketId: null,
                actualWord: null,
                status: 'playing',
                category
            });

            navigate('/game');
        } catch (err) {
            console.error(err);
            alert(`⚠️ ${err.message}\n\nMake sure the backend is running on port 5000!`);
        }
    };

    // ── MULTIPLAYER ───────────────────────────────────────────────

    // P1: Creates the room and waits for a code
    const handleCreateRoom = (rounds) => {
        setGameMode('multi');
        setJoinError('');
        socket.connect();
        // Store rounds in state immediately so GamePage can show them during the waiting screen
        setGameState(prev => ({ ...prev, rounds, phase: 'WAITING_FOR_PLAYERS' }));
        socket.emit('createRoom', { maxRounds: rounds });
        navigate('/game');
    };

    // P2: Joins with a room code only
    const handleJoinRoom = (roomCode) => {
        setGameMode('multi');
        setJoinError('');
        socket.connect();
        socket.emit('joinRoom', { roomCode });
        // Don't navigate yet — wait for matchStarting or joinError
    };

    // ── SOCKET LISTENERS ─────────────────────────────────────────

    useEffect(() => {
        // P1 receives their generated room code
        socket.on('roomCreated', ({ roomCode, maxRounds }) => {
            console.log('Room created:', roomCode);
            setRoomId(roomCode);
            setGameState(prev => ({
                ...prev,
                rounds: maxRounds,
                phase: 'WAITING_FOR_PLAYERS'
            }));
        });

        // Both players receive this when P2 joins — triggers match starting screen
        socket.on('matchStarting', ({ roomCode, maxRounds }) => {
            console.log('Match starting in room:', roomCode);
            setRoomId(roomCode);
            setGameState(prev => ({
                ...prev,
                rounds: maxRounds,
                phase: 'MATCH_STARTING'
            }));
            navigate('/game');
        });

        // P2 gets this if the room code is wrong/full/in-progress
        socket.on('joinError', (message) => {
            console.error('Join error:', message);
            setJoinError(message);
            socket.disconnect();
            setGameMode(null);
        });

        // Live game state from backend
        socket.on('gameUpdate', (game) => {
            console.log('Game update:', game);
            setGameState(prev => ({
                ...prev,
                correctLetters: game.correctLetters || [],
                wrongLetters:   game.wrongLetters   || [],
                word:           game.displayWord    ? game.displayWord.join('') : '',
                hint:           game.hint           || '',
                currentRound:   game.currentRound,
                phase:          game.phase,
                rounds:         game.maxRounds,
                scores:         game.scores,
                setterSocketId: game.setterSocketId || null,
                actualWord:     game.actualWord     || null,
                status:         game.status         || 'playing',
            }));

            if (game.phase === 'GAME_OVER') {
                setFinalScores(game.scores);
                navigate('/scoreboard');
            }
        });

        socket.on('error', () => triggerNotif());

        socket.on('opponentDisconnected', () => {
            alert('Your opponent has disconnected.');
            socket.disconnect();
            resetState();
            navigate('/mode-select');
        });

        return () => {
            socket.off('roomCreated');
            socket.off('matchStarting');
            socket.off('joinError');
            socket.off('gameUpdate');
            socket.off('error');
            socket.off('opponentDisconnected');
        };
    }, []);

    // ── GAME ACTIONS ──────────────────────────────────────────────

    const handleGuessLetter = (letter) => {
        if (gameMode === 'multi') {
            socket.emit('guessLetter', { roomCode: roomId, letter });
        } else {
            if (gameState.correctLetters.includes(letter) || gameState.wrongLetters.includes(letter)) {
                triggerNotif();
                return;
            }
            if (gameState.word.includes(letter)) {
                setGameState(prev => ({ ...prev, correctLetters: [...prev.correctLetters, letter] }));
            } else {
                setGameState(prev => ({ ...prev, wrongLetters: [...prev.wrongLetters, letter] }));
            }
        }
    };

    const handleSetWord = (word, hint) => {
        socket.emit('setWord', { roomCode: roomId, word: word.toLowerCase(), hint });
    };

    const handleRoundComplete = () => {
        if (gameMode === 'single') {
            const won = gameState.word.split('').every(l => gameState.correctLetters.includes(l));
            const newScore = won ? gameState.scores.p1 + 1 : gameState.scores.p1;

            setGameState(prev => ({ ...prev, scores: { ...prev.scores, p1: newScore } }));

            if (gameState.currentRound >= gameState.rounds) {
                setTimeout(() => {
                    setFinalScores({ p1: newScore, p2: 0 });
                    navigate('/scoreboard');
                }, 1500);
            } else {
                fetchNextWord(gameState.category, gameState.currentRound + 1, newScore);
            }
        }
        // Multiplayer: backend drives all transitions — intentional no-op here
    };

    const fetchNextWord = async (category, nextRound, currentScore) => {
        try {
            const response = await fetch(`/api/words/random?category=${encodeURIComponent(category)}`);
            const data = await response.json();
            setGameState(prev => ({
                ...prev,
                word: data.text.toLowerCase(),
                hint: data.hint || '',
                correctLetters: [],
                wrongLetters: [],
                currentRound: nextRound,
                phase: 'GUESSING',
                scores: { ...prev.scores, p1: currentScore }
            }));
        } catch (err) {
            console.error('fetchNextWord error:', err);
        }
    };

    // ── NAVIGATION HELPERS ────────────────────────────────────────

    const triggerNotif = () => {
        setShowNotif(true);
        setTimeout(() => setShowNotif(false), 2000);
    };

    const resetState = () => {
        setGameMode(null);
        setRoomId('');
        setJoinError('');
        setGameState({
            word: '', hint: '', correctLetters: [], wrongLetters: [],
            rounds: 0, currentRound: 1, phase: 'IDLE',
            scores: { p1: 0, p2: 0 }, setterSocketId: null,
            actualWord: null, status: 'playing', category: ''
        });
    };

    const handlePlayAgain = () => {
        socket.disconnect();
        resetState();
        navigate('/mode-select');
    };

    const handleBackToMenu = () => {
        socket.disconnect();
        resetState();
        navigate('/');
    };

    // ── ROUTES ────────────────────────────────────────────────────

    return (
        <div className="App">
            <Routes>
                <Route path="/" element={
                    <LandingPage onStart={() => navigate('/mode-select')} />
                } />

                <Route path="/mode-select" element={
                    <ModeSelectPage
                        onSelectMode={(mode, options) => {
                            if (mode === 'single') {
                                startSingleGame(options.category, options.rounds);
                            }
                            // Multiplayer is handled directly by onCreateRoom/onJoinRoom
                        }}
                        onCreateRoom={handleCreateRoom}
                        onJoinRoom={handleJoinRoom}
                        joinError={joinError}
                        onClearJoinError={() => setJoinError('')}
                        onBack={() => navigate('/')}
                    />
                } />

                <Route path="/game" element={
                    <GamePage
                        gameMode={gameMode}
                        gameState={gameState}
                        roomCode={roomId}
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