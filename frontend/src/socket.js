import { io } from 'socket.io-client';

// Connect to your Node.js backend
const URL = 'http://localhost:5000';

export const socket = io(URL, {
    autoConnect: false // We connect manually when the user joins a room
});