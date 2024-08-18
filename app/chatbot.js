import React, { useState, useRef, useEffect } from 'react';

const ChatBot = ({ isOpen, onClose, onSendMessage }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const handleSend = async () => {
    if (input.trim() === '') return;

    const userMessage = { text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    const botResponse = await onSendMessage(input);
    const botMessage = { text: botResponse, sender: 'bot' };
    setMessages(prev => [...prev, botMessage]);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-20 right-5 w-80 h-96  rounded-lg shadow-xl flex flex-col">
      <div className="p-4 bg-blue-950 text-white rounded-t-lg flex justify-between items-center">
        <h3 className="font-bold">Chat Bot</h3>
        <button onClick={onClose} className="text-white hover:text-gray-200">
          &times;
        </button>
      </div>
      <div className="flex-grow overflow-y-auto p-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`mb-4 ${
              message.sender === 'user' ? 'flex justify-end' : 'flex justify-start'
            }`}
          >
            <div
              className={`max-w-[70%] p-3 rounded-lg ${
                message.sender === 'user'
                  ? 'bg-blue-950 text-white'
                  : 'bg-slate-300 text-gray-800 shadow'
              }`}
            >
              <p className="text-sm">{message.text}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t">
        <div className="flex">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            className="flex-grow px-3 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-950"
            placeholder="Type a message..."
          />
          <button
            onClick={handleSend}
            className="px-4 py-2 bg-blue-950 text-white rounded-r-md hover: focus:outline-none focus:ring-2 focus:ring-blue-950 focus:ring-opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;