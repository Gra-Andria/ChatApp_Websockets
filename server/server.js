const WebSocket = require('ws');
const { connectDB, saveMessage, getMessages } = require('./db');

connectDB();
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', async (ws) => {
    console.log('Nouveau client connecté');

    // Envoi d'un message de bienvenue
    ws.send(JSON.stringify({
        type: 'system',
        content: 'Bienvenue sur le chat!'
    }));

    // Messages historiques
    const messages = await getMessages();
    ws.send(JSON.stringify({
        type: 'history',
        content: messages
    }));

    // Messages entrants
    ws.on('message', async (message) => {
        console.log(`Message reçu: ${message}`);

        try {
            const parsedMessage = JSON.parse(message);

            // Enregistrement du message dans le BD
            const savedMessage = await saveMessage({
                username: parsedMessage.username,
                content: parsedMessage.content,
                timestamp: new Date()
            });

            // Diffusion du message à tous
            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({
                        type: 'message',
                        username: savedMessage.username,
                        content: savedMessage.content,
                        timestamp: savedMessage.timestamp
                    }));
                }
            });
        } catch (error) {
            console.error('Erreur de traitement du message:', error);
        }
    });

    // Déconnexion
    ws.on('close', () => {
        console.log('Client déconnecté');
    });
});

console.log('Serveur WebSocket démarré sur ws://localhost:8080');