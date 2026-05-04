const rooms = new Map();

function generateRoomCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
    return code;
}

module.exports = (io, socket) => {

    // ── P1: CREATE ROOM ──────────────────────────────────────────
    socket.on('createRoom', ({ maxRounds, username }) => {
        let roomCode;
        do { roomCode = generateRoomCode(); } while (rooms.has(roomCode));

        rooms.set(roomCode, {
            players:         [socket.id],
            usernames:       [username || 'Player 1'],   // track usernames for stats
            maxRounds:       Math.min(Math.max(maxRounds, 1), 20),
            currentRound:    1,
            turnWithinRound: 0,   // 0 = first half, 1 = second half
            turnIndex:       0,   // which player is the setter
            phase:           'WAITING_FOR_PLAYERS',
            word:            '',
            hint:            '',
            correctLetters:  [],
            wrongLetters:    [],
            status:          'playing',
            scores:          { p1: 0, p2: 0 }
        });

        socket.join(roomCode);
        console.log(`Room ${roomCode} created by ${socket.id} (${username})`);
        socket.emit('roomCreated', { roomCode, maxRounds: rooms.get(roomCode).maxRounds });
    });

    // ── P2: JOIN ROOM ────────────────────────────────────────────
    socket.on('joinRoom', ({ roomCode, username }) => {
        const code = roomCode.toUpperCase();
        const game = rooms.get(code);

        if (!game)                              { socket.emit('joinError', 'Room not found. Double-check the code.'); return; }
        if (game.players.length >= 2)           { socket.emit('joinError', 'Room is full.'); return; }
        if (game.phase !== 'WAITING_FOR_PLAYERS') { socket.emit('joinError', 'Game already in progress.'); return; }

        game.players.push(socket.id);
        game.usernames.push(username || 'Player 2');
        socket.join(code);
        console.log(`${username} joined room ${code}`);

        io.to(code).emit('matchStarting', { roomCode: code, maxRounds: game.maxRounds });

        setTimeout(() => {
            const g = rooms.get(code);
            if (!g) return;
            g.phase = 'SETTING_WORD';
            emitGameUpdate(io, g, code);
        }, 2500);
    });

    // ── SET WORD ─────────────────────────────────────────────────
    socket.on('setWord', ({ roomCode, word, hint }) => {
        const game = rooms.get(roomCode);
        if (!game || game.phase !== 'SETTING_WORD') return;
        if (socket.id !== game.players[game.turnIndex]) return;

        game.word           = word.toLowerCase().trim();
        game.hint           = hint || '';
        game.phase          = 'GUESSING';
        game.correctLetters = [];
        game.wrongLetters   = [];
        game.status         = 'playing';

        console.log(`Word set in room ${roomCode}`);
        emitGameUpdate(io, game, roomCode);
    });

    // ── GUESS LETTER ─────────────────────────────────────────────
    socket.on('guessLetter', ({ roomCode, letter }) => {
        const game = rooms.get(roomCode);
        if (!game || game.phase !== 'GUESSING') return;

        const guesserIndex = game.turnIndex === 0 ? 1 : 0;
        if (socket.id !== game.players[guesserIndex]) return;

        const char = letter.toLowerCase().trim();
        if (game.correctLetters.includes(char) || game.wrongLetters.includes(char)) {
            socket.emit('error', 'Letter already guessed!');
            return;
        }

        if (game.word.includes(char)) game.correctLetters.push(char);
        else                          game.wrongLetters.push(char);

        const isWin = game.word.split('').every(l => game.correctLetters.includes(l));
        if (isWin) {
            game.status = 'win';
            handleRoundEnd(roomCode, io);
        } else if (game.wrongLetters.length >= 6) {
            game.status = 'lose';
            handleRoundEnd(roomCode, io);
        } else {
            emitGameUpdate(io, game, roomCode);
        }
    });

    // ── DISCONNECT ───────────────────────────────────────────────
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        for (const [roomCode, game] of rooms.entries()) {
            if (!game.players.includes(socket.id)) continue;
            game.players = game.players.filter(p => p !== socket.id);
            if (game.players.length === 0) {
                rooms.delete(roomCode);
                console.log(`Room ${roomCode} deleted (empty)`);
            } else {
                io.to(roomCode).emit('opponentDisconnected');
            }
        }
    });
};

// ── HELPERS ──────────────────────────────────────────────────────

function handleRoundEnd(roomCode, io) {
    const game = rooms.get(roomCode);

    // Guesser wins → guesser scores. Guesser fails → setter scores.
    if (game.status === 'win') {
        game.turnIndex === 0 ? game.scores.p2++ : game.scores.p1++;
    } else {
        game.turnIndex === 0 ? game.scores.p1++ : game.scores.p2++;
    }

    // Reveal word to both on round end
    emitGameUpdate(io, game, roomCode, true);

    setTimeout(() => {
        const g = rooms.get(roomCode);
        if (!g) return;

        if (g.turnWithinRound === 0) {
            // ── First half done → flip roles for second half ──────
            g.turnWithinRound = 1;
            g.turnIndex       = g.turnIndex === 0 ? 1 : 0;
            g.phase           = 'SETTING_WORD';
            g.word            = '';
            g.hint            = '';
            g.correctLetters  = [];
            g.wrongLetters    = [];
            g.status          = 'playing';
            console.log(`Room ${roomCode} — Round ${g.currentRound} second half`);
        } else {
            // ── Both halves done → full round complete ─────────────
            g.turnWithinRound = 0;

            if (g.currentRound >= g.maxRounds) {
                g.phase = 'GAME_OVER';
                console.log(`Game over in ${roomCode}. P1=${g.scores.p1} P2=${g.scores.p2}`);
            } else {
                g.currentRound++;
                g.turnIndex      = 0;
                g.phase          = 'SETTING_WORD';
                g.word           = '';
                g.hint           = '';
                g.correctLetters = [];
                g.wrongLetters   = [];
                g.status         = 'playing';
                console.log(`Room ${roomCode} — Round ${g.currentRound} started`);
            }
        }

        emitGameUpdate(io, g, roomCode);
    }, 3500);
}

// Sends different payloads per player:
// - Setter always receives actualWord
// - Guesser only receives actualWord on round end (revealAll = true)
// - Each player receives the opponent's username for stats saving
function emitGameUpdate(io, game, roomCode, revealAll = false) {
    const base          = getMaskedState(game);
    const setterIndex   = game.turnIndex;
    const guesserIndex  = setterIndex === 0 ? 1 : 0;

    // Setter
    const setterSocketId = game.players[setterIndex];
    if (setterSocketId) {
        io.to(setterSocketId).emit('gameUpdate', {
            ...base,
            actualWord:       game.word,
            opponentUsername: game.usernames[guesserIndex] || 'Player'
        });
    }

    // Guesser
    const guesserSocketId = game.players[guesserIndex];
    if (guesserSocketId) {
        io.to(guesserSocketId).emit('gameUpdate', {
            ...base,
            actualWord:       revealAll ? game.word : base.actualWord,
            opponentUsername: game.usernames[setterIndex] || 'Player'
        });
    }
}

function getMaskedState(game) {
    const { word, ...safeGame } = game;
    return {
        ...safeGame,
        displayWord: word.split('').map(l => game.correctLetters.includes(l) ? l : '_'),
        actualWord:  (game.status === 'win' || game.status === 'lose' || game.phase === 'GAME_OVER')
            ? word : null,
        setterSocketId: game.players[game.turnIndex] || null,
    };
}