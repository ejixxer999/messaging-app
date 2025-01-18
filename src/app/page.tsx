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
    const [isTyping, setIsTyping] = useState(false)
    const socketRef = useRef<Socket | null>(null); // Initialize useRef
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

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
    const handleTyping = () => {
        setIsTyping(true)
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)

        typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 2000)
    }

    const stopTyping = () => {
        setIsTyping(false)
    }

    return (
        <div className='flex flex-col items-center justify-center min-h-screen bg-gray-100'>
            <div className='w-full max-w-md p-4 bh-white rounded-lg shadow-lg'>
                <div className='message-container'>
            <ul id="messages" className='space-y-2 rounded-md'>
                {messages.map((msg, index) => (
                    <li key={index} className='px-4 py-2 bg-gray-200 rounded-md'>{msg.content}</li>
                ))}
            </ul>
                </div>
            <form onSubmit={sendMessage} className='flex mt-4'>
                <input
                    id="input"
                    autoComplete="off"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="input-field"
                    placeholder="Write your message"
                    onKeyUp={handleTyping}
                    onBlur={stopTyping}
                />
                <button className="text-white bg-gray-800 hover:bg-gray-900 focus:outline-none
                 focus:ring-4 focus:ring-gray-300 font-medium rounded-full text-sm px-5 py-2.5 me-2 mb-2
                  dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700
                   dark:border-gray-700">Send</button>
                   {isTyping && (
                    <div className="typing-indicator">
                        <div className="typing-dot"></div>
                        <div className="typing-dot"></div>
                        <div className="typing-dot"></div>
                    </div>
                   )}
            </form>
            </div>
        </div>
    );
}
