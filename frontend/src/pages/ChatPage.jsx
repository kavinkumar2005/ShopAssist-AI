import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Send, Sparkles, Bot, RotateCcw, Plus, 
  MessageSquare, SlidersHorizontal, ArrowDown 
} from 'lucide-react';
import { sendChatMessage } from '../services/api';
import ChatMessage from '../components/ChatMessage';
import { useUser } from '../context/UserContext';

export const ChatPage = () => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const { addSearchHistory } = useUser();

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I'm **ShopAssist AI**, your intelligent shopping companion. Tell me what you're looking for, your budget, or specific use cases (e.g. *'I need a laptop under ₹60,000 for coding, ML, and gaming with 16GB RAM'*), and I'll find and compare the ideal options for you!",
      intent: "System Greeting",
      suggested_chips: [
        "Laptop under ₹60,000 for ML & Coding",
        "Compare HP Victus and Lenovo LOQ",
        "Best phone under 40k with flagship camera",
        "Headphones with ANC and 40h+ battery"
      ]
    }
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Handle query param from landing page or navbar
  useEffect(() => {
    if (initialQuery && messages.length === 1) {
      handleSend(initialQuery);
    }
  }, [initialQuery]);

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    // Add user message
    const userMsg = { role: 'user', content: query.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Track in user search history
    addSearchHistory(query.trim());

    try {
      const response = await sendChatMessage({
        message: query.trim(),
        conversation_id: conversationId,
      });

      if (response.conversation_id) {
        setConversationId(response.conversation_id);
      }

      const botMsg = {
        role: 'assistant',
        content: response.reply,
        intent: response.intent,
        recommended_products: response.recommended_products,
        refinement_needed: response.refinement_needed,
        suggested_chips: response.suggested_chips
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: "Sorry, I encountered an issue connecting to the AI inference service. Please check your backend connection.",
          intent: "Error"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = () => {
    setConversationId(null);
    setMessages([
      {
        role: 'assistant',
        content: "New conversation started! What would you like to discover today?",
        intent: "System Ready",
        suggested_chips: [
          "Laptop under ₹60,000 for ML & Coding",
          "Compare HP Victus and Lenovo LOQ",
          "Smartphone with Snapdragon 8 Gen 3",
          "Tablets for digital drawing & college"
        ]
      }
    ]);
  };

  const handleSelectChip = (chipText) => {
    handleSend(chipText);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col h-[calc(100vh-6.5rem)]">
      {/* Top Chat Header */}
      <div className="glass-panel p-3.5 rounded-2xl flex items-center justify-between mb-4 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <span>ShopAssist AI Assistant</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                Grounded RAG Mode
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Natural Language Product Search & Factual Reasoning
            </p>
          </div>
        </div>

        <button
          onClick={handleNewChat}
          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition-colors"
          title="Reset conversation"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>New Chat</span>
        </button>
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-4">
        {messages.map((msg, index) => (
          <ChatMessage
            key={index}
            message={msg}
            onSelectChip={handleSelectChip}
          />
        ))}

        {/* Typing Loading Indicator */}
        {loading && (
          <div className="flex gap-3 my-4 justify-start">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center text-white shrink-0 animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="glass-panel p-4 rounded-2xl rounded-tl-none border border-slate-700/60 flex items-center gap-2 text-slate-300 text-xs">
              <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              <span className="ml-2 font-medium text-slate-400">Searching FAISS index & analyzing specs...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box and Prompt Suggestions */}
      <div className="mt-4 pt-2">
        {/* Quick Suggestion Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-1 scrollbar-none">
          <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider shrink-0">
            Ideas:
          </span>
          {[
            "Laptops under ₹60,000 for coding & ML",
            "Compare HP Victus and Lenovo LOQ",
            "Best ANC headphones for flights",
            "Apple M3 vs Intel Core Ultra laptops"
          ].map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSend(prompt)}
              className="text-xs shrink-0 px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-indigo-300 border border-slate-800 transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="glass-panel p-2 rounded-2xl border border-slate-700/80 shadow-2xl flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything, e.g. 'I need a laptop under 60k for machine learning with 16GB RAM'..."
            className="flex-1 bg-transparent px-3 py-2 text-sm text-white placeholder-slate-400 focus:outline-none"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-40 text-white shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95 disabled:hover:scale-100"
            title="Send query"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-[11px] text-slate-500 mt-2">
          Grounded on 50 verified product specifications. Factual responses with zero hallucination.
        </p>
      </div>
    </div>
  );
};

export default ChatPage;
