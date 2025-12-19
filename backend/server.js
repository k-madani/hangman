const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());

const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Point this to your React app URL
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5000;

io.on('connection', (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`User Disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`SERVER RUNNING ON PORT ${PORT}`);
});