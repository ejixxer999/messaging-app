"use client";

import { useEffect, useState, useRef } from 'react';
import io, { Socket } from 'socket.io-client';
import CryptoJS from 'crypto-js';

interface Message {
    content: string;
}

const secretKey = process.env.SECRET_KEY || 'default-secret-key'; // Use a fallback

export default function Home() {
    const [message, setMessage] = useState<string>('');
    const [messages, setMessages] = useState<Message[]>([]);
    const socketRef = useRef<Socket | null>(null); // Initialize useRef

    useEffect(() => {
        socketRef.current = io();

        socketRef.current.on('chat message', (encryptedMsg: string) => {
            console.log('Encrypted message received:', encryptedMsg);
            const bytes = CryptoJS.AES.decrypt(encryptedMsg, secretKey);
            const decryptedMessage = bytes.toString(CryptoJS.enc.Utf8);
            console.log('Decrypted message:', decryptedMessage);
            setMessages((prevMessages) => [...prevMessages, { content: decryptedMessage }]);
        });

        return () => {
            socketRef.current?.disconnect();
        };
    }, []);

    const sendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (message && socketRef.current) {
            const encryptedMessage = CryptoJS.AES.encrypt(message, secretKey).toString();
            console.log('Original message:', message);
            console.log('Encrypted message:', encryptedMessage);
            socketRef.current.emit('chat message', encryptedMessage);
            setMessage('');
        }
    };

    return (
        <div>
            <ul id="messages">
                {messages.map((msg, index) => (
                    <li key={index}>{msg.content}</li>
                ))}
            </ul>
            <form onSubmit={sendMessage}>
                <input
                    id="input"
                    autoComplete="off"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />
                <button>Send</button>
            </form>
        </div>
    );
}
