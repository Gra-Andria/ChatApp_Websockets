document.addEventListener('DOMContentLoaded', () => {
    const loginSection = document.getElementById('login-section');
    const chatSection = document.getElementById('chat-section');
    const loginBtn = document.getElementById('login-btn');
    const usernameInput = document.getElementById('username');
    const sendBtn = document.getElementById('send-btn');
    const messageInput = document.getElementById('message-input');
    const chatContainer = document.getElementById('chat-container');

    let ws;
    let username = '';

    // Connexion
    loginBtn.addEventListener('click', () => {
        username = usernameInput.value.trim();

        if (username) {
            loginSection.style.display = 'none';
            chatSection.style.display = 'flex';
            connectWebSocket();
        } else {
            alert('Veuillez entrer un pseudo');
        }
    });

    // Connexion WebSocket
    function connectWebSocket() {
        ws = new WebSocket('ws://localhost:8080');

        ws.onopen = () => {
            console.log('Connecté au serveur WebSocket');
            displaySystemMessage('Vous êtes connecté au chat');
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.type === 'history') {
                // Affichage des messages du plus récent au plus ancien
                data.content.reverse().forEach(msg => {
                    displayMessage(msg);
                });
            } else if (data.type === 'system') {
                displaySystemMessage(data.content);
            } else if (data.type === 'message') {
                displayMessage(data);
            }
        };

        ws.onclose = () => {
            console.log('Déconnecté du serveur WebSocket');
            displaySystemMessage('Connexion perdue. Tentative de reconnexion...');
            setTimeout(connectWebSocket, 3000);
        };

        ws.onerror = (error) => {
            console.error('Erreur WebSocket:', error);
            displaySystemMessage('Erreur de connexion au serveur');
        };
    }

    // Envoyer un message
    sendBtn.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    function sendMessage() {
        const content = messageInput.value.trim();

        if (content && ws) {
            const message = {
                username: username,
                content: content,
                timestamp: new Date()
            };

            ws.send(JSON.stringify(message));
            messageInput.value = '';
        }
    }

    // Affichage d'une notification système
    function displaySystemMessage(content) {
        const messageElement = document.createElement('div');
        messageElement.className = 'message system-message';
        messageElement.textContent = content;
        chatContainer.appendChild(messageElement);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    // Affichage d'un message 
    function displayMessage(data) {
        const messageElement = document.createElement('div');
        const isCurrentUser = data.username === username;

        messageElement.className = isCurrentUser ? 'message user-message' : 'message other-message';

        if (!isCurrentUser || data.type === 'history') {
            const usernameElement = document.createElement('span');
            usernameElement.className = 'username';
            usernameElement.textContent = data.username;
            messageElement.appendChild(usernameElement);
        }

        const contentElement = document.createElement('span');
        contentElement.textContent = data.content;
        messageElement.appendChild(contentElement);

        const timestampElement = document.createElement('span');
        timestampElement.className = 'timestamp';
        const date = new Date(data.timestamp);
        timestampElement.textContent = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        messageElement.appendChild(timestampElement);

        chatContainer.appendChild(messageElement);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
});