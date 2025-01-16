import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { config } from 'dotenv';
import next from 'next';
import CryptoJS from 'crypto-js';

// Load environment variables
config();

const secretKey = process.env.S_KEY || 'default-secret-key'; // Fallback to default if undefined

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const server = express();
    const httpServer = http.createServer(server);
    const io = new SocketIOServer(httpServer);

    server.get('*', (req, res) => {
        return handle(req, res);
    });

    io.on('connection', (socket) => {
        console.log('a user connected');
        socket.on('disconnect', () => {
            console.log('user disconnected');
        });
        socket.on('chat message', (encryptedMsg) => {
            const bytes = CryptoJS.AES.decrypt(encryptedMsg, secretKey);
            const decryptedMessage = bytes.toString(CryptoJS.enc.Utf8);
            io.emit('chat message', encryptedMsg);
        });
    });

    httpServer.listen(3000, () => {
        console.log('Listening on port 3000');
    });
});
