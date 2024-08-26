import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import { Chat } from "./models/chat.model.js";
import { User } from "./models/user.model.js";
import { Message } from "./models/message.model.js";

// Kết nối đến MongoDB
mongoose.connect('mongodb+srv://hoanganhkemosabe:5WAoKdOl5dgFuOuw@social-network.4j2gil3.mongodb.net/', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

// Tạo ứng dụng HTTP và Socket.IO
const server = http.createServer();
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173', // Địa chỉ của frontend
        methods: ['GET', 'POST'],
    }
});

// Sử dụng socket.io để lắng nghe các kết nối
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('join_room', async (roomId) => {
        socket.join(roomId);
        console.log(`User ${socket.id} joined room ${roomId}`);

        try {
            // Load all previous messages in the chat
            const messages = await Message.find({ chat: roomId }).populate('sender');
            socket.emit('load_messages', messages);
        } catch (err) {
            console.error('Error loading messages:', err);
        }
    });

    socket.on('send_message', async (data) => {
        const { chatId, senderId, content } = data;

        try {
            // Lưu tin nhắn vào MongoDB
            const newMessage = await Message.create({
                chat: chatId,
                sender: senderId,
                content,
            });

            // Populate sender information
            const populatedMessage = await Message.findById(newMessage._id).populate('sender');

            io.to(chatId).emit('receive_message', populatedMessage);
        } catch (err) {
            console.error('Error sending message:', err);
        }
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

const PORT = process.env.SOCKET_PORT || 3000;
server.listen(PORT, () => console.log(`Socket server running on port ${PORT}`));
