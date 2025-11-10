import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { GoogleGenAI, Chat } from "@google/genai";
import { Spinner } from './icons/Spinner';

const API_KEY = process.env.API_KEY;

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatInstance = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!API_KEY) {
      setError("API_KEY environment variable is not set");
      return;
    }
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    chatInstance.current = ai.chats.create({
      model: 'gemini-2.5-flash',
      // Optional: Add system instructions or history
    });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !chatInstance.current) return;

    const userMessage: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await chatInstance.current.sendMessage({ message: input });
      const modelMessage: ChatMessage = { role: 'model', text: response.text };
      setMessages(prev => [...prev, modelMessage]);
    } catch (e) {
      setError('Mesaj gönderilirken bir hata oluştu. Lütfen tekrar deneyin.');
      console.error(e);
      // Restore user message to input if sending fails
      setMessages(prev => prev.slice(0, -1));
      setInput(userMessage.text);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[65vh] bg-black/20 rounded-lg shadow-lg border border-white/10">
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-2xl ${msg.role === 'user' ? 'bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-br-none' : 'bg-gray-700/50 text-gray-200 rounded-bl-none'}`}>
              <p className="whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
        {isLoading && (
            <div className="flex justify-start">
                <div className="max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-2xl bg-gray-700/50 text-gray-200 rounded-bl-none">
                    <Spinner/>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {error && <p className="text-red-400 text-sm px-4 pb-2 text-center">{error}</p>}
      
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()}
            placeholder="Bir mesaj yazın..."
            className="flex-1 bg-black/20 border border-gray-600 text-white rounded-full py-2 px-4 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-full p-2 hover:from-cyan-400 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
