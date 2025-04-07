const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    username: { type: String, required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', messageSchema);

async function connectDB() {
    try {
        await mongoose.connect('mongodb://localhost:27017/chatdb');
        console.log('Connecté à MongoDB');
    } catch (error) {
        console.error('Erreur de connexion à MongoDB:', error);
    }
}

async function saveMessage(message) {
    const newMessage = new Message(message);
    return await newMessage.save();
}

async function getMessages() {
    return await Message.find().sort({ timestamp: -1 });
}

module.exports = { connectDB, saveMessage, getMessages };