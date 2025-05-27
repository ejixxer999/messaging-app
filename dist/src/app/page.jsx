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
    var _c = useState(false), isTyping = _c[0], setIsTyping = _c[1];
    var socketRef = useRef(null); // Initialize useRef
    var typingTimeoutRef = useRef(null);
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
    var handleTyping = function () {
        setIsTyping(true);
        if (typingTimeoutRef.current)
            clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(function () { return setIsTyping(false); }, 2000);
    };
    var stopTyping = function () {
        setIsTyping(false);
    };
    return (<div className='flex flex-col items-center justify-center min-h-screen bg-gray-100'>
            <div className='w-full max-w-md p-4 bh-white rounded-lg shadow-lg'>
                <div className='message-container'>
            <ul id="messages" className='space-y-2 rounded-md'>
                {messages.map(function (msg, index) { return (<li key={index} className='px-4 py-2 bg-gray-200 rounded-md'>{msg.content}</li>); })}
            </ul>
                </div>
            <form onSubmit={sendMessage} className='flex mt-4'>
                <input id="input" autoComplete="off" value={message} onChange={function (e) { return setMessage(e.target.value); }} className="input-field" placeholder="Write your message" onKeyUp={handleTyping} onBlur={stopTyping}/>
                <button className="text-white bg-gray-800 hover:bg-gray-900 focus:outline-none
                 focus:ring-4 focus:ring-gray-300 font-medium rounded-full text-sm px-5 py-2.5 me-2 mb-2
                  dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700
                   dark:border-gray-700">Send</button>
                   {isTyping && (<div className="typing-indicator">
                        <div className="typing-dot"></div>
                        <div className="typing-dot"></div>
                        <div className="typing-dot"></div>
                    </div>)}
            </form>
            </div>
        </div>);
}
