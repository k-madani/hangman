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
const connectDB = require('./config/database'); // We will build this next
require('dotenv').config();

const app = express();

// 1. Connect to MongoDB
connectDB();

// 2. Middleware
app.use(cors());        // Allows your React app to talk to this server
app.use(express.json()); // Allows the server to read JSON sent in API requests

// 3. Create the HTTP Server
const server = http.createServer(app);

// 4. Initialize Socket.io
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000", // Your React URL
        methods: ["GET", "POST"]
    }
});

// 5. Port Configuration
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});