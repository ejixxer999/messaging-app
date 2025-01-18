import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { config } from 'dotenv';
import next from 'next';
import CryptoJS from 'crypto-js';
// Load environment variables
config();
var secretKey = process.env.SECRET_KEY || 'default-secret-key';
var dev = process.env.NODE_ENV !== 'production';
var app = next({ dev: dev });
var handle = app.getRequestHandler();
app.prepare().then(function () {
    var server = express();
    var httpServer = createServer(server);
    var io = new SocketIOServer(httpServer);
    server.get('*', function (req, res) { return handle(req, res); });
    io.on('connection', function (socket) {
        console.log('a user connected');
        socket.on('disconnect', function () { return console.log('user disconnected'); });
        socket.on('chat message', function (encryptedMsg) {
            console.log('Encrypted message received:', encryptedMsg);
            var bytes = CryptoJS.AES.decrypt(encryptedMsg, secretKey);
            var decryptedMessage = bytes.toString(CryptoJS.enc.Utf8);
            console.log('Decrypted message:', decryptedMessage);
            io.emit('chat message', encryptedMsg);
        });
    });
    httpServer.listen(3000, function () {
        console.log('Listening on port 3000');
    });
});
