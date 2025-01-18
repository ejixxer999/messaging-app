"use client";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import CryptoJS from 'crypto-js';
var secretKey = process.env.SECRET_KEY || 'default-secret-key'; // Use a fallback
export default function Home() {
    var _a = useState(''), message = _a[0], setMessage = _a[1];
    var _b = useState([]), messages = _b[0], setMessages = _b[1];
    var socketRef = useRef(null); // Initialize useRef
    useEffect(function () {
        socketRef.current = io();
        socketRef.current.on('chat message', function (encryptedMsg) {
            console.log('Encrypted message received:', encryptedMsg);
            var bytes = CryptoJS.AES.decrypt(encryptedMsg, secretKey);
            var decryptedMessage = bytes.toString(CryptoJS.enc.Utf8);
            console.log('Decrypted message:', decryptedMessage);
            setMessages(function (prevMessages) { return __spreadArray(__spreadArray([], prevMessages, true), [{ content: decryptedMessage }], false); });
        });
        return function () {
            var _a;
            (_a = socketRef.current) === null || _a === void 0 ? void 0 : _a.disconnect();
        };
    }, []);
    var sendMessage = function (e) {
        e.preventDefault();
        if (message && socketRef.current) {
            var encryptedMessage = CryptoJS.AES.encrypt(message, secretKey).toString();
            console.log('Original message:', message);
            console.log('Encrypted message:', encryptedMessage);
            socketRef.current.emit('chat message', encryptedMessage);
            setMessage('');
        }
    };
    return (<div>
            <ul id="messages">
                {messages.map(function (msg, index) { return (<li key={index}>{msg.content}</li>); })}
            </ul>
            <form onSubmit={sendMessage}>
                <input id="input" autoComplete="off" value={message} onChange={function (e) { return setMessage(e.target.value); }}/>
                <button>Send</button>
            </form>
        </div>);
}
