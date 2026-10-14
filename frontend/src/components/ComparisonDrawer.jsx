import React from 'react';
import { Link } from 'react-router-dom';
import { Scale, X, ArrowRight } from 'lucide-react';
import { useComparison } from '../context/ComparisonContext';

export const ComparisonDrawer = () => {
  const { compareItems, removeFromCompare, clearCompare } = useComparison();

  if (compareItems.length === 0) return null;

  return (
    <aside 
      aria-label="Product comparison dock"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-4xl glass-panel rounded-2xl p-3 shadow-2xl shadow-indigo-950/60 border border-indigo-500/30 animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-200">
              Comparing Products ({compareItems.length}/4)
            </div>
            <div className="text-[11px] text-slate-400">
              Side-by-side specs, benchmark comparison, & AI verdict
            </div>
          </div>
        </div>

        {/* Thumbnail chips */}
        <div className="flex items-center gap-2 overflow-x-auto max-w-full py-1">
          {compareItems.map(p => (
            <div
              key={p.id}
              className="flex items-center gap-2 bg-slate-800/90 pl-1.5 pr-2 py-1 rounded-xl border border-slate-700/60 text-xs shrink-0 group"
            >
              <img
                src={p.image_url}
                alt={p.name}
                className="w-7 h-7 rounded-lg object-cover"
              />
              <div className="max-w-[110px] truncate font-medium text-slate-200">
                {p.name}
              </div>
              <button
                onClick={() => removeFromCompare(p.id)}
                className="text-slate-400 hover:text-rose-400 transition-colors p-0.5"
                title="Remove"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={clearCompare}
            className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1.5 transition-colors"
          >
            Clear
          </button>
          <Link
            to="/compare"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-indigo-600/25 transition-all"
          >
            Compare Now
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </aside>
  );
};

export default ComparisonDrawer;
