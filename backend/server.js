/**
 * Importing Dependencies: Bringing in the tools we need (Express, Socket.io, Mongoose)
 * Middleware Setup: Configuring how the server handles data (like JSON or CORS)
 * Connecting to the Database: Bringing your MongoDB Atlas cluster online
 * Listening: Opening a "Port" so the frontend can talk to it
 */
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const wordRoutes = require('./routes/wordRoutes');
const socketController = require('./controllers/socketController');
const connectDB = require('./config/database');
require('dotenv').config();

const app = express();

// 1. Connect to MongoDB
connectDB();

// 2. Middleware
app.use(cors());
app.use(express.json());

// 3. Create the HTTP Server
const server = http.createServer(app);

// 4. Initialize Socket.io
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
    }
});

// 5. API Routes (register before server listens)
app.use('/api/words', wordRoutes);

// 6. Socket.io Connection Handler
io.on('connection', (socket) => {
    console.log(`New client connected: ${socket.id}`);
    socketController(io, socket);
    
    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
    });
});

// 7. Port Configuration
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});