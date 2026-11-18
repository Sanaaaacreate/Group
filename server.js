const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Store current group name and online users in memory
let groupName = "🌸Hello Dosto😊🙂";
let activeUsers = {};

// Serve Frontend directly from Node.js
app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html>
<html lang="hi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🌸Hello Dosto😊🙂 - Live Chat</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        body { background-color: #0b141a; color: #e9edef; height: 100vh; display: flex; justify-content: center; align-items: center; overflow: hidden; }
        
        /* Login Screen */
        #login-screen { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: #111b21; display: flex; justify-content: center; align-items: center; z-index: 1000; }
        .login-box { background: #202c33; padding: 40px; border-radius: 12px; text-align: center; width: 350px; box-shadow: 0 4px 20px rgba(0,0,0,0.5); }
        .login-box h2 { color: #00a884; margin-bottom: 20px; }
        .login-box input { width: 100%; padding: 12px; margin-bottom: 20px; background: #2a3942; border: none; border-radius: 6px; color: #fff; font-size: 16px; outline: none; }
        .login-box button { width: 100%; padding: 12px; background: #00a884; border: none; border-radius: 6px; color: #fff; font-size: 16px; font-weight: bold; cursor: pointer; transition: 0.2s; }
        .login-box button:hover { background: #029374; }

        /* Chat Container */
        .chat-container { width: 100%; max-width: 900px; height: 100%; background: #0b141a; display: flex; flex-direction: column; position: relative; }
        @media(min-width: 768px) { .chat-container { height: 92vh; border-radius: 10px; box-shadow: 0 10px 30px rgba(0,0,0,0.6); } }

        /* Header */
        .chat-header { background: #202c33; padding: 10px 15px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #222d34; }
        .header-left { display: flex; align-items: center; gap: 12px; }
        .group-avatar { width: 40px; height: 40px; background: #00a884; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; color: #fff; }
        .group-info h3 { font-size: 16px; font-weight: 600; color: #e9edef; }
        .group-info p { font-size: 12px; color: #8696a0; }
        .header-right { position: relative; }
        .menu-btn { background: none; border: none; color: #aebac1; font-size: 20px; cursor: pointer; padding: 8px; border-radius: 50%; }
        .menu-btn:hover { background: #374248; }

        /* Dropdown Menu */
        .dropdown-menu { display: none; position: absolute; right: 0; top: 45px; background: #233138; border-radius: 4px; box-shadow: 0 4px 12px rgba(0,0,0,0.4); width: 200px; z-index: 100; }
        .dropdown-menu.active { display: block; }
        .dropdown-item { padding: 12px 16px; font-size: 14px; color: #e9edef; cursor: pointer; display: flex; align-items: center; gap: 10px; border-bottom: 1px solid #2a3942; }
        .dropdown-item:hover { background: #182229; }

        /* Messages Area */
        .chat-messages { flex: 1; background: #0b141a url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png') repeat; padding: 15px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; }
        .message { max-width: 70%; padding: 8px 12px; border-radius: 7.5px; position: relative; word-wrap: break-word; font-size: 14.5px; box-shadow: 0 1px 0.5px rgba(0,0,0,0.13); }
        .message.incoming { background: #202c33; align-self: flex-start; border-top-left-radius: 0; }
        .message.outgoing { background: #005c4b; align-self: flex-end; border-top-right-radius: 0; }
        .sender-name { font-size: 12px; font-weight: bold; color: #53bdeb; margin-bottom: 2px; }
        .message-time { font-size: 10px; color: #8696a0; float: right; margin-left: 10px; margin-top: 4px; }
        
        /* Media in Chat */
        .msg-img, .msg-video { width: 100%; max-height: 250px; border-radius: 6px; cursor: pointer; object-fit: cover; margin-top: 4px; }
        .file-box { display: flex; align-items: center; gap: 10px; background: rgba(0,0,0,0.2); padding: 8px; border-radius: 6px; margin-top: 4px; }
        .file-box i { font-size: 24px; color: #00a884; }
        .download-btn { background: #00a884; color: #fff; border: none; padding: 4px 8px; border-radius: 4px; font-size: 12px; cursor: pointer; text-decoration: none; }

        /* Input Area */
        .chat-input-area { background: #202c33; padding: 10px 15px; display: flex; align-items: center; gap: 10px; }
        .chat-input-area input[type="text"] { flex: 1; background: #2a3942; border: none; border-radius: 8px; padding: 10px 15px; color: #fff; font-size: 15px; outline: none; }
        .icon-action-btn { background: none; border: none; color: #8696a0; font-size: 20px; cursor: pointer; }
        .icon-action-btn:hover { color: #e9edef; }
        .send-btn { background: #00a884; border: none; color: #fff; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 16px; }

        /* Modal / Popups */
        .modal { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); justify-content: center; align-items: center; z-index: 200; }
        .modal-content { background: #222d34; padding: 25px; border-radius: 10px; width: 320px; text-align: center; }
        .modal-content h3 { margin-bottom: 15px; color: #e9edef; }
        .modal-content input { width: 100%; padding: 10px; background: #2a3942; border: none; border-radius: 6px; color: #fff; margin-bottom: 15px; outline: none; }
        .modal-buttons { display: flex; justify-content: flex-end; gap: 10px; }
        .modal-buttons button { padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; }
        .btn-cancel { background: #374248; color: #fff; }
        .btn-ok { background: #00a884; color: #fff; }

        /* Members List Modal */
        .members-list { max-height: 200px; overflow-y: auto; text-align: left; margin-bottom: 15px; background: #111b21; padding: 10px; border-radius: 6px; }
        .member-item { padding: 6px 0; border-bottom: 1px solid #222d34; font-size: 14px; display: flex; align-items: center; gap: 8px; }
        .member-item i { color: #00a884; font-size: 10px; }

        /* Full Image View Modal */
        #media-modal { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); justify-content: center; align-items: center; z-index: 300; }
        #media-modal img { max-width: 90%; max-height: 90%; border-radius: 8px; }
        .close-media { position: absolute; top: 20px; right: 30px; color: #fff; font-size: 30px; cursor: pointer; }
    </style>
</head>
<body>

    <!-- Login Screen -->
    <div id="login-screen">
        <div class="login-box">
            <h2>🌸 Hello Dosto 🌸</h2>
            <p style="color: #8696a0; font-size: 14px; margin-bottom: 20px;">चैट में शामिल होने के लिए अपना नाम दर्ज करें</p>
            <input type="text" id="username-input" placeholder="अपना नाम लिखें..." autocomplete="off">
            <button onclick="joinChat()">चैट में जाएं</button>
        </div>
    </div>

    <!-- Main Chat Interface -->
    <div class="chat-container" id="chat-container" style="display: none;">
        <!-- Header -->
        <div class="chat-header">
            <div class="header-left">
                <div class="group-avatar"><i class="fa-solid fa-users"></i></div>
                <div class="group-info">
                    <h3 id="group-title-display">🌸Hello Dosto😊🙂</h3>
                    <p id="online-count-text">ऑनलाइन मेंबर्स दिख रहे हैं...</p>
                </div>
            </div>
            <div class="header-right">
                <button class="menu-btn" onclick="toggleMenu()"><i class="fa-solid fa-ellipsis-vertical"></i></button>
                <!-- Dropdown Menu -->
                <div class="dropdown-menu" id="dropdown-menu">
                    <div class="dropdown-item" onclick="openMembersModal()"><i class="fa-solid fa-user-group"></i> ऑनलाइन मेंबर्स देखें</div>
                    <div class="dropdown-item" onclick="openRenameModal()"><i class="fa-solid fa-pen"></i> ग्रुप का नाम बदलें</div>
                    <div class="dropdown-item" onclick="clearMyChat()"><i class="fa-solid fa-trash"></i> चैट हिस्ट्री साफ करें</div>
                </div>
            </div>
        </div>

        <!-- Chat Messages -->
        <div class="chat-messages" id="chat-messages"></div>

        <!-- Input Area -->
        <div class="chat-input-area">
            <label for="media-file-input" class="icon-action-btn"><i class="fa-solid fa-paperclip"></i></label>
            <input type="file" id="media-file-input" style="display: none;" onchange="sendFile(event)">
            <input type="text" id="message-input" placeholder="संदेश टाइप करें..." onkeypress="handleKeyPress(event)">
            <button class="send-btn" onclick="sendMessage()"><i class="fa-solid fa-paper-plane"></i></button>
        </div>
    </div>

    <!-- Members Modal -->
    <div class="modal" id="members-modal">
        <div class="modal-content">
            <h3>ऑनलाइन मेंबर्स</h3>
            <div class="members-list" id="members-list-box"></div>
            <div class="modal-buttons">
                <button class="btn-ok" onclick="closeMembersModal()">बंद करें</button>
            </div>
        </div>
    </div>

    <!-- Rename Group Modal -->
    <div class="modal" id="rename-modal">
        <div class="modal-content">
            <h3>ग्रुप का नया नाम रखें</h3>
            <input type="text" id="new-group-name-input" placeholder="नया नाम...">
            <div class="modal-buttons">
                <button class="btn-cancel" onclick="closeRenameModal()">रद्द करें</button>
                <button class="btn-ok" onclick="updateGroupName()">बदलें</button>
            </div>
        </div>
    </div>

    <!-- Full Image Modal -->
    <div id="media-modal" onclick="closeMediaModal()">
        <span class="close-media">&times;</span>
        <img id="modal-img-tag" src="">
    </div>

    <!-- Socket.io Script -->
    <script src="/socket.io/socket.io.js"></script>
    <script>
        const socket = io();
        let myName = "";
        let onlineUsersList = [];

        function joinChat() {
            const input = document.getElementById('username-input').value.trim();
            if (!input) {
                alert("कृपया अपना नाम दर्ज करें!");
                return;
            }
            myName = input;
            document.getElementById('login-screen').style.display = 'none';
            document.getElementById('chat-container').style.display = 'flex';
            socket.emit('join-chat', myName);
            loadLocalChat();
        }

        function toggleMenu() {
            document.getElementById('dropdown-menu').classList.toggle('active');
        }

        // Close dropdown when clicking outside
        window.onclick = function(event) {
            if (!event.target.matches('.menu-btn') && !event.target.matches('.fa-ellipsis-vertical')) {
                const dropdown = document.getElementById('dropdown-menu');
                if (dropdown.classList.contains('active')) {
                    dropdown.classList.remove('active');
                }
            }
        }

        function handleKeyPress(e) {
            if (e.key === 'Enter') sendMessage();
        }

        function sendMessage() {
            const input = document.getElementById('message-input');
            const text = input.value.trim();
            if (!text) return;

            const msgData = { name: myName, type: 'text', content: text, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) };
            socket.emit('chat-message', msgData);
            input.value = '';
        }

        function sendFile(event) {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = function(e) {
                let fileType = 'file';
                if (file.type.startsWith('image/')) fileType = 'image';
                else if (file.type.startsWith('video/')) fileType = 'video';

                const msgData = {
                    name: myName,
                    type: fileType,
                    content: e.target.result,
                    fileName: file.name,
                    time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                };
                socket.emit('chat-message', msgData);
            };
            reader.readAsDataURL(file);
        }

        socket.on('chat-message', (data) => {
            appendMessage(data);
            saveToLocalChat(data);
        });

        socket.on('update-group-name', (name) => {
            document.getElementById('group-title-display').innerText = name;
        });

        socket.on('update-users-list', (users) => {
            onlineUsersList = users;
            document.getElementById('online-count-text').innerText = `${users.length} मेंबर्स ऑनलाइन`;
        });

        function appendMessage(data) {
            const chatMessages = document.getElementById('chat-messages');
            const isOutgoing = data.name === myName;
            const msgDiv = document.createElement('div');
            msgDiv.className = `message ${isOutgoing ? 'outgoing' : 'incoming'}`;

            let contentHTML = `<div class="sender-name">${data.name}</div>`;
            
            if (data.type === 'text') {
                contentHTML += `<div>${escapeHtml(data.content)}</div>`;
            } else if (data.type === 'image') {
                contentHTML += `<img src="${data.content}" class="msg-img" onclick="openMediaModal('${data.content}')">`;
            } else if (data.type === 'video') {
                contentHTML += `<video src="${data.content}" class="msg-video" controls></video>`;
            } else {
                contentHTML += `<div class="file-box">
                    <i class="fa-solid fa-file-arrow-down"></i>
                    <div style="flex:1; font-size:13px; word-break:break-all;">${data.fileName}</div>
                    <a href="${data.content}" download="${data.fileName}" class="download-btn">डाउनलोड</a>
                </div>`;
            }

            contentHTML += `<span class="message-time">${data.time}</span>`;
            msgDiv.innerHTML = contentHTML;
            chatMessages.appendChild(msgDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }

        // Local Storage for Clear Chat Feature
        function saveToLocalChat(data) {
            let history = JSON.parse(localStorage.getItem('chat_history') || '[]');
            history.push(data);
            localStorage.setItem('chat_history', JSON.stringify(history));
        }

        function loadLocalChat() {
            let history = JSON.parse(localStorage.getItem('chat_history') || '[]');
            history.forEach(data => appendMessage(data));
        }

        function clearMyChat() {
            localStorage.removeItem('chat_history');
            document.getElementById('chat-messages').innerHTML = '';
            alert("आपकी चैट हिस्ट्री साफ़ कर दी गई है!");
            toggleMenu();
        }

        // Modals Functions
        function openMembersModal() {
            toggleMenu();
            const box = document.getElementById('members-list-box');
            box.innerHTML = '';
            onlineUsersList.forEach(user => {
                box.innerHTML += `<div class="member-item"><i class="fa-solid fa-circle"></i> ${user}</div>`;
            });
            document.getElementById('members-modal').style.display = 'flex';
        }
        function closeMembersModal() { document.getElementById('members-modal').style.display = 'none'; }

        function openRenameModal() {
            toggleMenu();
            document.getElementById('rename-modal').style.display = 'flex';
        }
        function closeRenameModal() { document.getElementById('rename-modal').style.display = 'none'; }

        function updateGroupName() {
            const newName = document.getElementById('new-group-name-input').value.trim();
            if (newName) {
                socket.emit('change-group-name', newName);
                closeRenameModal();
            }
        }

        function openMediaModal(src) {
            document.getElementById('modal-img-tag').src = src;
            document.getElementById('media-modal').style.display = 'flex';
        }
        function closeMediaModal() { document.getElementById('media-modal').style.display = 'none'; }

        function escapeHtml(text) {
            return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        }
    </script>
</body>
</html>
`);
});

// Socket.io Real-time Logic
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
        io.emit('update-us server.jsers-list', Object.values(connectedUsers));
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
