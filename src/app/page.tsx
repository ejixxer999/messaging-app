"use client"

import { useEffect, useState } from 'react';
import io from 'socket.io-client';

interface Message {
    content: string;  // Ensure 'content' is lowercase
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let socket: any;

export default function Home() {
    const [message, setMessage] = useState<string>('');
    const [messages, setMessages] = useState<Message[]>([]);

    useEffect(() => {
        socket = io();

        socket.on('chat message', (msg: string) => {
            setMessages((prevMessages) => [...prevMessages, { content: msg }]);
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    const sendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (message) {
            socket.emit('chat message', message);
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
