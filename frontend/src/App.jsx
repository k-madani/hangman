import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { socket } from './socket';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import ModeSelectPage from './pages/ModeSelectPage';
import GamePage from './pages/GamePage';
import ScoreboardPage from './pages/ScoreboardPage';
import AuthPage from './pages/AuthPage';
import ProfileModal from './components/ProfileModal';
import Navbar from './components/Navbar';
import Notification from './components/Notification';
import './App.css';

function AppContent() {
    const navigate = useNavigate();
    const { user, loading, authFetch, setUser } = useAuth();

    const [gameMode, setGameMode]       = useState(null);
    const [roomId, setRoomId]           = useState('');
    const [joinError, setJoinError]     = useState('');
    const [finalScores, setFinalScores] = useState({ p1: 0, p2: 0 });
    const [showNotif, setShowNotif]     = useState(false);
    const [playable]                    = useState(true);
    const [showAuth, setShowAuth]       = useState(false);
    const [showProfile, setShowProfile] = useState(false);

    // Track opponent username for stats saving
    const [opponentUsername, setOpponentUsername] = useState('');

    const [gameState, setGameState] = useState({
        word:          '',
        hint:          '',
        correctLetters: [],
        wrongLetters:  [],
        rounds:        0,
        currentRound:  1,
        phase:         'IDLE',
        scores:        { p1: 0, p2: 0 },
        setterSocketId: null,
        actualWord:    null,
        status:        'playing',
        category:      ''
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

    // ── STATS SAVING ──────────────────────────────────────────────

    const saveSingleResult = async (score, rounds, category) => {
        if (!user) return;
        try {
            const res = await authFetch('http://localhost:5000/api/auth/save-single-result', {
                method: 'POST',
                body: JSON.stringify({ score, rounds, category })
            });
            if (res.ok) {
                const data = await res.json();
                // Update user in context so widget reflects new stats immediately
                if (data.user) setUser(data.user);
            }
        } catch (err) {
            console.error('saveSingleResult error:', err.message);
        }
    };

    const saveMultiResult = async (myScore, opponentScore, oppUsername, rounds, result) => {
        if (!user) return;
        try {
            const res = await authFetch('http://localhost:5000/api/auth/save-multi-result', {
                method: 'POST',
                body: JSON.stringify({
                    myScore,
                    opponentScore,
                    opponentUsername: oppUsername,
                    rounds,
                    result
                })
            });
            if (res.ok) {
                const data = await res.json();
                if (data.user) setUser(data.user);
            }
        } catch (err) {
            console.error('saveMultiResult error:', err.message);
        }
    };

    // ── MULTIPLAYER ───────────────────────────────────────────────

    const handleCreateRoom = (rounds) => {
        setGameMode('multi');
        setJoinError('');
        socket.connect();
        setGameState(prev => ({ ...prev, rounds, phase: 'WAITING_FOR_PLAYERS' }));
        socket.emit('createRoom', {
            maxRounds: rounds,
            username: user?.username || 'Player 1'
        });
        navigate('/game');
    };

    const handleJoinRoom = (roomCode) => {
        setGameMode('multi');
        setJoinError('');
        socket.connect();
        socket.emit('joinRoom', {
            roomCode,
            username: user?.username || 'Player 2'
        });
    };

    // ── SOCKET LISTENERS ─────────────────────────────────────────

    useEffect(() => {
        socket.on('roomCreated', ({ roomCode, maxRounds }) => {
            setRoomId(roomCode);
            setGameState(prev => ({ ...prev, rounds: maxRounds, phase: 'WAITING_FOR_PLAYERS' }));
        });

        socket.on('matchStarting', ({ roomCode, maxRounds }) => {
            setRoomId(roomCode);
            setGameState(prev => ({ ...prev, rounds: maxRounds, phase: 'MATCH_STARTING' }));
            navigate('/game');
        });

        socket.on('joinError', (message) => {
            setJoinError(message);
            socket.disconnect();
            setGameMode(null);
        });

        socket.on('gameUpdate', (game) => {
            // Track opponent username whenever we receive it
            if (game.opponentUsername) setOpponentUsername(game.opponentUsername);

            setGameState(prev => ({
                ...prev,
                correctLetters: game.correctLetters || [],
                wrongLetters:   game.wrongLetters   || [],
                word:           game.displayWord ? game.displayWord.join('') : '',
                hint:           game.hint        || '',
                currentRound:   game.currentRound,
                phase:          game.phase,
                rounds:         game.maxRounds,
                scores:         game.scores,
                setterSocketId: game.setterSocketId || null,
                actualWord:     game.actualWord     || null,
                status:         game.status         || 'playing',
            }));

            if (game.phase === 'GAME_OVER') {
                const p1 = game.scores.p1;
                const p2 = game.scores.p2;
                setFinalScores({ p1, p2 });

                // Save multiplayer result
                // We need to know if current user is p1 or p2
                // p1 = players[0] = whoever created the room
                // We track this via socket.id vs setterSocketId at round 1
                // Simpler: compare scores using opponentUsername we tracked
                const myScore  = p1;  // frontend always tracks as p1 from their perspective
                const oppScore = p2;
                const result   = myScore > oppScore ? 'win' : myScore < oppScore ? 'loss' : 'tie';
                saveMultiResult(myScore, oppScore, game.opponentUsername || opponentUsername, game.maxRounds, result);

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
    }, [opponentUsername]);

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
            const won      = gameState.word.split('').every(l => gameState.correctLetters.includes(l));
            const newScore = won ? gameState.scores.p1 + 1 : gameState.scores.p1;
            setGameState(prev => ({ ...prev, scores: { ...prev.scores, p1: newScore } }));

            if (gameState.currentRound >= gameState.rounds) {
                setTimeout(() => {
                    const finalScore = { p1: newScore, p2: 0 };
                    setFinalScores(finalScore);
                    // Save single player result
                    saveSingleResult(newScore, gameState.rounds, gameState.category);
                    navigate('/scoreboard');
                }, 1500);
            } else {
                fetchNextWord(gameState.category, gameState.currentRound + 1, newScore);
            }
        }
    };

    const fetchNextWord = async (category, nextRound, currentScore) => {
        try {
            const response = await fetch(`/api/words/random?category=${encodeURIComponent(category)}`);
            const data = await response.json();
            setGameState(prev => ({
                ...prev,
                word:           data.text.toLowerCase(),
                hint:           data.hint || '',
                correctLetters: [],
                wrongLetters:   [],
                currentRound:   nextRound,
                phase:          'GUESSING',
                scores:         { ...prev.scores, p1: currentScore }
            }));
        } catch (err) {
            console.error('fetchNextWord error:', err);
        }
    };

    // ── HELPERS ───────────────────────────────────────────────────

    const triggerNotif = () => {
        setShowNotif(true);
        setTimeout(() => setShowNotif(false), 2000);
    };

    const resetState = () => {
        setGameMode(null);
        setRoomId('');
        setJoinError('');
        setOpponentUsername('');
        setGameState({
            word: '', hint: '', correctLetters: [], wrongLetters: [],
            rounds: 0, currentRound: 1, phase: 'IDLE',
            scores: { p1: 0, p2: 0 }, setterSocketId: null,
            actualWord: null, status: 'playing', category: ''
        });
    };

    const handlePlayAgain  = () => { socket.disconnect(); resetState(); navigate('/mode-select'); };
    const handleBackToMenu = () => { socket.disconnect(); resetState(); navigate('/'); };

    if (loading) return null;

    return (
        <div className="App">
            <Navbar
                onSignIn={() => setShowAuth(true)}
                onOpenProfile={() => setShowProfile(true)}
            />

            {showAuth && (
                <AuthPage
                    onSuccess={() => setShowAuth(false)}
                    onBack={() => setShowAuth(false)}
                />
            )}

            {showProfile && (
                <ProfileModal
                    user={user}
                    onClose={() => setShowProfile(false)}
                />
            )}

            <Routes>
                <Route path="/" element={
                    <LandingPage onStart={() => navigate('/mode-select')} />
                } />

                <Route path="/mode-select" element={
                    <ModeSelectPage
                        onSelectMode={(mode, options) => {
                            if (mode === 'single') startSingleGame(options.category, options.rounds);
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
                        userStats={user?.stats}
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
            <AuthProvider>
                <AppContent />
            </AuthProvider>
        </Router>
    );
}

export default App;