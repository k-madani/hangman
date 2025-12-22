const Word = require('../models/Word');

// In-memory store to track game states for each room
const rooms = new Map();

module.exports = (io, socket) => {
    // 1. JOIN ROOM & INITIALIZE ROUNDS
    socket.on('joinRoom', ({ roomId, maxRounds }) => {
        socket.join(roomId);

        if (!rooms.has(roomId)) {
            rooms.set(roomId, {
                players: [], 
                maxRounds: Math.min(Math.max(maxRounds, 1), 10), // Limit 1-10 rounds
                currentRound: 1,
                turnIndex: 0, // 0 = Player 1 sets, 1 = Player 2 sets
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
        
        io.to(roomId).emit('gameUpdate', getMaskedState(game));
    });

    // 3. GUESS LETTER (Phase: GUESSING)
    socket.on('guessLetter', ({ roomId, letter }) => {
        const game = rooms.get(roomId);
        if (!game || game.phase !== 'GUESSING') return;

        // The guesser is always the player who is NOT the setter
        const guesserIndex = game.turnIndex === 0 ? 1 : 0;
        if (socket.id !== game.players[guesserIndex]) return;

        const char = letter.toLowerCase();
        if (game.word.includes(char)) {
            if (!game.correctLetters.includes(char)) game.correctLetters.push(char);
        } else {
            if (!game.wrongLetters.includes(char)) game.wrongLetters.push(char);
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
        // Optional: Handle room cleanup if players leave
    });
};

// --- HELPER FUNCTIONS ---

function handleRoundEnd(roomId, io) {
    const game = rooms.get(roomId);
    
    // Update scores (turnIndex 0 means P1 set, P2 guessed)
    if (game.status === 'win') {
        game.turnIndex === 0 ? game.scores.p2++ : game.scores.p1++;
    } else {
        game.turnIndex === 0 ? game.scores.p1++ : game.scores.p2++;
    }

    // Check if total match is over
    if (game.currentRound >= game.maxRounds) {
        game.phase = 'GAME_OVER';
    } else {
        // Prepare next round: Swap Roles
        game.currentRound++;
        game.turnIndex = game.turnIndex === 0 ? 1 : 0; 
        game.phase = 'SETTING_WORD';
        game.word = '';
        game.correctLetters = [];
        game.wrongLetters = [];
        game.status = 'playing';
    }

    io.to(roomId).emit('gameUpdate', getMaskedState(game));
}

// Function to hide the word from the client unless game is over
function getMaskedState(game) {
    return {
        ...game,
        displayWord: game.word.split('').map(l => game.correctLetters.includes(l) ? l : ''),
        // Only reveal the actual word if the round is lost or game is over
        actualWord: (game.status === 'lose' || game.phase === 'GAME_OVER') ? game.word : null
    };
}