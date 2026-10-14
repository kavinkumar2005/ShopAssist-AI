import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Check, Plus, Cpu, HardDrive, Eye } from 'lucide-react';
import { useComparison } from '../context/ComparisonContext';

export const ProductCard = ({ product, compact = false }) => {
  const { addToCompare, removeFromCompare, isInCompare } = useComparison();
  const compared = isInCompare(product.id);

  const handleCompareClick = (e) => {
    e.preventDefault();
    if (compared) {
      removeFromCompare(product.id);
    } else {
      addToCompare(product);
    }
  };

  return (
    <div className="glass-card rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 group">
      {/* Product Image & Badges */}
      <div className="relative aspect-[16/10] bg-slate-900/80 overflow-hidden">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
        
        {/* Category & Brand Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-950/80 backdrop-blur text-slate-200 border border-slate-700/50">
            {product.category}
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-600/80 backdrop-blur text-white">
            {product.brand}
          </span>
        </div>

        {/* Stock status badge */}
        <div className="absolute top-3 right-3">
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium backdrop-blur ${
            product.stock_status === 'In Stock' 
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
          }`}>
            {product.stock_status}
          </span>
        </div>

        {/* Price & Rating Overlay */}
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
          <div>
            <div className="text-xl font-bold text-white tracking-tight drop-shadow">
              ₹{product.price.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="flex items-center gap-1 bg-slate-950/80 backdrop-blur px-2 py-1 rounded-md border border-slate-800 text-xs font-medium text-amber-400">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span>{product.rating}</span>
            <span className="text-slate-400 text-[10px]">({product.reviews_count})</span>
          </div>
        </div>
      </div>

      {/* Body Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <Link to={`/product/${product.id}`} className="group-hover:text-indigo-400 transition-colors">
            <h3 className="font-semibold text-slate-100 line-clamp-1 text-base leading-snug">
              {product.name}
            </h3>
          </Link>

          {!compact && (
            <p className="text-slate-400 text-xs mt-1.5 line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          )}

          {/* Quick Hardware Spec Badges */}
          <div className="flex flex-wrap gap-2 mt-3 text-xs text-slate-300">
            {product.ram && product.ram !== 'N/A' && (
              <div className="flex items-center gap-1 bg-slate-800/80 px-2 py-1 rounded-md border border-slate-700/50">
                <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                <span>{product.ram}</span>
              </div>
            )}
            {product.processor && product.processor !== 'N/A' && (
              <div className="flex items-center gap-1 bg-slate-800/80 px-2 py-1 rounded-md border border-slate-700/50 line-clamp-1 max-w-[170px]" title={product.processor}>
                <span className="truncate">{product.processor}</span>
              </div>
            )}
            {product.storage && product.storage !== 'N/A' && (
              <div className="flex items-center gap-1 bg-slate-800/80 px-2 py-1 rounded-md border border-slate-700/50">
                <HardDrive className="w-3.5 h-3.5 text-purple-400" />
                <span>{product.storage}</span>
              </div>
            )}
          </div>

          {/* Use Cases tags */}
          {!compact && product.use_cases && product.use_cases.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {product.use_cases.slice(0, 3).map((uc, i) => (
                <span key={i} className="text-[11px] px-2 py-0.5 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-800/30">
                  {uc}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Card Actions */}
        <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center gap-2">
          <Link
            to={`/product/${product.id}`}
            className="flex-1 py-2 px-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors border border-slate-700/50"
          >
            <Eye className="w-3.5 h-3.5" />
            View Details
          </Link>
          
          <button
            onClick={handleCompareClick}
            className={`py-2 px-3 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all border ${
              compared
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20'
                : 'bg-slate-800/50 hover:bg-indigo-600/20 text-slate-300 hover:text-indigo-300 border-slate-700/50 hover:border-indigo-500/40'
            }`}
            title={compared ? "Remove from comparison" : "Add to comparison"}
          >
            {compared ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            {compared ? 'Comparing' : 'Compare'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
