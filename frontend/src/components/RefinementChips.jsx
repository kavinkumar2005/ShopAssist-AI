import React from 'react';
import { Sparkles } from 'lucide-react';

export const RefinementChips = ({ chips = [], onSelectChip }) => {
  if (!chips || chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mt-3 pt-2 border-t border-slate-800/60">
      <div className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
        <Sparkles className="w-3 h-3 text-indigo-400" />
        Suggested:
      </div>
      {chips.map((chip, idx) => (
        <button
          key={idx}
          onClick={() => onSelectChip(chip)}
          className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-950/40 hover:bg-indigo-600/30 text-indigo-300 hover:text-white border border-indigo-500/30 hover:border-indigo-400 transition-all duration-200 cursor-pointer shadow-sm hover:scale-105 active:scale-95"
        >
          {chip}
        </button>
      ))}
    </div>
  );
};

export default RefinementChips;
