const express    = require('express');
const http       = require('http');
const { Server } = require('socket.io');
const cors       = require('cors');
const cookieParser = require('cookie-parser');
const wordRoutes   = require('./routes/wordRoutes');
const authRoutes   = require('./routes/authRoutes');
const socketController = require('./controllers/socketController');
const connectDB    = require('./config/database');
const { startCronJob } = require('./jobs/cronJob');
require('dotenv').config();

const app = express();

// 1. Connect to MongoDB
connectDB();

// 2. Middleware
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true  // Required for cookies to be sent cross-origin
}));
app.use(express.json());
app.use(cookieParser()); // Parses httpOnly refresh token cookie

// 3. HTTP Server
const server = http.createServer(app);

// 4. Socket.io
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true
    }
});

// 5. REST Routes
app.use('/api/words', wordRoutes);
app.use('/api/auth',  authRoutes);

// 6. Socket.io Connections
io.on('connection', (socket) => {
    console.log(`New client connected: ${socket.id}`);
    socketController(io, socket);

    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
    });
});

// 7. Cron Job
startCronJob();

// 8. Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});