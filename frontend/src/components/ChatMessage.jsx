import React from 'react';
import { Bot, User, Sparkles } from 'lucide-react';
import ProductCard from './ProductCard';
import RefinementChips from './RefinementChips';

export const ChatMessage = ({ message, onSelectChip }) => {
  const isUser = message.role === 'user';

  // Format assistant text with markdown bolding and bullet points
  const formatText = (content) => {
    if (!content) return null;
    
    // Split by double newline into paragraphs
    const paragraphs = content.split('\n\n');
    return paragraphs.map((p, pIdx) => {
      // Check if it's a bullet list
      if (p.includes('\n- ') || p.startsWith('- ')) {
        const lines = p.split('\n');
        return (
          <ul key={pIdx} className="list-disc list-inside space-y-1 my-2">
            {lines.map((line, lIdx) => {
              const cleaned = line.replace(/^[-\s*]+/, '');
              return (
                <li key={lIdx} className="text-slate-300 text-sm leading-relaxed">
                  {renderFormattedInline(cleaned)}
                </li>
              );
            })}
          </ul>
        );
      }

      // Check numbered list
      if (/^\d+\.\s/.test(p)) {
        const lines = p.split('\n');
        return (
          <div key={pIdx} className="space-y-1.5 my-2">
            {lines.map((line, lIdx) => (
              <div key={lIdx} className="text-slate-300 text-sm leading-relaxed">
                {renderFormattedInline(line)}
              </div>
            ))}
          </div>
        );
      }

      return (
        <p key={pIdx} className="text-slate-200 text-sm leading-relaxed my-1.5">
          {renderFormattedInline(p)}
        </p>
      );
    });
  };

  // Helper to render bold markdown (**text**)
  const renderFormattedInline = (text) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-semibold text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div className={`flex gap-3 my-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {/* Assistant Avatar */}
      {!isUser && (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-600/30">
          <Bot className="w-4 h-4" />
        </div>
      )}

      {/* Message Content Container */}
      <div className={`max-w-3xl flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`p-4 rounded-2xl ${
            isUser
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 rounded-tr-none'
              : 'glass-panel text-slate-100 rounded-tl-none border border-slate-700/60 shadow-xl'
          }`}
        >
          {isUser ? (
            <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">
              {message.content}
            </p>
          ) : (
            <div>
              {message.intent && (
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-2">
                  <Sparkles className="w-2.5 h-2.5" />
                  {message.intent}
                </div>
              )}
              {formatText(message.content)}
            </div>
          )}

          {/* Refinement Chips if available */}
          {!isUser && message.suggested_chips && message.suggested_chips.length > 0 && (
            <RefinementChips
              chips={message.suggested_chips}
              onSelectChip={onSelectChip}
            />
          )}
        </div>

        {/* Inline Recommended Product Cards inside chat */}
        {!isUser && message.recommended_products && message.recommended_products.length > 0 && (
          <div className="w-full mt-4">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span>Top Grounded Matches ({message.recommended_products.length})</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full">
              {message.recommended_products.map((prod) => (
                <ProductCard key={prod.id} product={prod} compact={true} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0">
          <User className="w-4 h-4" />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
