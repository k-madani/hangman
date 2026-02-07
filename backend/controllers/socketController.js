const Word = require('../models/Word');

// In-memory store to track game states for each room
const rooms = new Map();

module.exports = (io, socket) => {
    // 1. JOIN ROOM & INITIALIZE ROUNDS
    socket.on('joinRoom', ({ roomId, maxRounds }) => {
        socket.join(roomId);
        console.log(`Player ${socket.id} joined room ${roomId}`);

        if (!rooms.has(roomId)) {
            rooms.set(roomId, {
                players: [], 
                maxRounds: Math.min(Math.max(maxRounds, 1), 10),
                currentRound: 1,
                turnIndex: 0,
                phase: 'WAITING_FOR_PLAYERS',
                word: '',
                hint: '',
                correctLetters: [],
                wrongLetters: [],
                status: 'playing',
                scores: { p1: 0, p2: 0 }
            });
        }

        const game = rooms.get(roomId);
        
        // Add player to the list if there is space
        if (game.players.length < 2 && !game.players.includes(socket.id)) {
            game.players.push(socket.id);
        }

        // Start the game once 2 players are in
        if (game.players.length === 2 && game.phase === 'WAITING_FOR_PLAYERS') {
            game.phase = 'SETTING_WORD';
            game.status = 'playing';
        }

        io.to(roomId).emit('gameUpdate', getMaskedState(game));
    });

    // 2. SET WORD (Phase: SETTING_WORD)
    socket.on('setWord', ({ roomId, word, hint }) => {
        const game = rooms.get(roomId);
        if (!game || game.phase !== 'SETTING_WORD') return;

        // Check if the person setting the word is the correct player for this turn
        if (socket.id !== game.players[game.turnIndex]) return;

        game.word = word.toLowerCase().trim();
        game.hint = hint || "No hint provided";
        game.phase = 'GUESSING';
        game.correctLetters = [];
        game.wrongLetters = [];
        game.status = 'playing';
        
        console.log(`Word set in room ${roomId}: ${game.word}`);
        io.to(roomId).emit('gameUpdate', getMaskedState(game));
    });

    // 3. GUESS LETTER (Phase: GUESSING)
    socket.on('guessLetter', ({ roomId, letter }) => {
        const game = rooms.get(roomId);
        if (!game || game.phase !== 'GUESSING') return;

        // The guesser is always the player who is NOT the setter
        const guesserIndex = game.turnIndex === 0 ? 1 : 0;
        if (socket.id !== game.players[guesserIndex]) return;

        const char = letter.toLowerCase().trim();
        
        // Check if letter already guessed
        if (game.correctLetters.includes(char) || game.wrongLetters.includes(char)) {
            io.to(roomId).emit('error', 'Letter already guessed!');
            return;
        }

        if (game.word.includes(char)) {
            game.correctLetters.push(char);
        } else {
            game.wrongLetters.push(char);
        }

        // Check Win/Loss conditions
        const isWin = game.word.split('').every(l => game.correctLetters.includes(l));
        if (isWin) {
            game.status = 'win';
            handleRoundEnd(roomId, io);
        } else if (game.wrongLetters.length >= 6) {
            game.status = 'lose';
            handleRoundEnd(roomId, io);
        } else {
            io.to(roomId).emit('gameUpdate', getMaskedState(game));
        }
    });

    // 4. DISCONNECT
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        // Clean up empty rooms
        for (const [roomId, game] of rooms.entries()) {
            game.players = game.players.filter(p => p !== socket.id);
            if (game.players.length === 0) {
                rooms.delete(roomId);
            }
        }
    });
};

// --- HELPER FUNCTIONS ---

function handleRoundEnd(roomId, io) {
    const game = rooms.get(roomId);
    
    // Update scores
    if (game.status === 'win') {
        game.turnIndex === 0 ? game.scores.p2++ : game.scores.p1++;
    } else {
        game.turnIndex === 0 ? game.scores.p1++ : game.scores.p2++;
    }

    // Check if total match is over
    if (game.currentRound >= game.maxRounds) {
        game.phase = 'GAME_OVER';
        console.log(`Game over in room ${roomId}. Scores: P1=${game.scores.p1}, P2=${game.scores.p2}`);
    } else {
        // Prepare next round: Swap Roles
        game.currentRound++;
        game.turnIndex = game.turnIndex === 0 ? 1 : 0; 
        game.phase = 'SETTING_WORD';
        game.word = '';
        game.correctLetters = [];
        game.wrongLetters = [];
        game.status = 'playing';
        console.log(`Round ${game.currentRound} starting in room ${roomId}`);
    }

    io.to(roomId).emit('gameUpdate', getMaskedState(game));
}

// Function to hide the word from the client unless game is over
function getMaskedState(game) {
    return {
        ...game,
        displayWord: game.word.split('').map(l => game.correctLetters.includes(l) ? l : '_'),
        actualWord: (game.status === 'lose' || game.phase === 'GAME_OVER') ? game.word : null
    };
}