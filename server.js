const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Public folder को सेट करना ताकि index.html लोड हो सके
app.use(express.static(path.join(__dirname, 'public')));

// Store group name and online users in memory
let groupName = "🌸Hello Dosto😊🙂";
let connectedUsers = {};

io.on('connection', (socket) => {
    socket.on('join-chat', (name) => {
        socket.username = name;
        connectedUsers[socket.id] = name;
        io.emit('update-users-list', Object.values(connectedUsers));
        socket.emit('update-group-name', groupName);
    });

    socket.on('chat-message', (data) => {
        io.emit('chat-message', data);
    });

    socket.on('change-group-name', (name) => {
        groupName = name;
        io.emit('update-group-name', groupName);
    });

    socket.on('disconnect', () => {
        delete connectedUsers[socket.id];
        io.emit('update-users-list', Object.values(connectedUsers));
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
