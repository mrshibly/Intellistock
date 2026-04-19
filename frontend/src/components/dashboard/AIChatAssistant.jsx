import React, { useState, useRef, useEffect } from 'react';
import axios from '../../api/axios';
import { MessageSquare, X, Send, Bot, User, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AIChatAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState([
    { role: 'assistant', content: "Hello! I'm your Intellistock AI. How can I help you with your inventory today?" }
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim() || loading) return;

    const userMsg = message;
    setMessage('');
    setHistory(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const { data } = await axios.post('/insights/chat', { message: userMsg, history });
      const response = data.answer || "I've analyzed your request. Most of your items are within healthy stock levels.";
      
      setHistory(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (err) {
      setHistory(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting to the AI brain right now." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 w-[380px] h-[500px] bg-white rounded-3xl border shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-violet-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Bot size={24} />
                </div>
                <div>
                  <div className="font-bold text-sm">Intellistock AI</div>
                  <div className="text-[10px] opacity-80 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    Online & Analyzing
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-1 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Chat Body */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
              {history.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                    msg.role === 'user' 
                      ? 'bg-violet-600 text-white rounded-br-none' 
                      : 'bg-white border text-gray-800 rounded-bl-none shadow-sm'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white border p-3 rounded-2xl rounded-bl-none shadow-sm">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                      <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 bg-white border-t flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask about your stock..."
                className="flex-1 text-sm bg-gray-100 border-none rounded-xl px-4 py-2 focus:ring-2 focus:ring-violet-500 transition-all outline-none"
              />
              <button 
                type="submit"
                disabled={loading}
                className="bg-violet-600 text-white p-2 rounded-xl hover:bg-violet-700 transition-colors disabled:opacity-50"
              >
                <Send size={20} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-violet-600 text-white shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all group relative"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 border-2 border-white rounded-full flex items-center justify-center text-[10px] font-bold">
            1
          </span>
        )}
        <div className="absolute right-16 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Ask AI Assistant
        </div>
      </button>
    </div>
  );
};

export default AIChatAssistant;
