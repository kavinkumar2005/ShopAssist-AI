import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Scale, Trophy, Check, X, Sparkles, Plus, 
  Trash2, ArrowRight, Star, Cpu, AlertCircle 
} from 'lucide-react';
import { compareProducts, getProducts } from '../services/api';
import { useComparison } from '../context/ComparisonContext';

export const ComparisonPage = () => {
  const [searchParams] = useSearchParams();
  const { compareItems, removeFromCompare, addToCompare, clearCompare } = useComparison();

  const [productsToCompare, setProductsToCompare] = useState([]);
  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [selectedToAdd, setSelectedToAdd] = useState('');

  // Default comparison presets
  const presets = [
    { title: "HP Victus 15 vs Lenovo LOQ 15 (Gaming & ML Laptops)", ids: [1, 2] },
    { title: "iPhone 15 vs Samsung Galaxy S24 (Flagship Phones)", ids: [16, 17] },
    { title: "Sony WH-1000XM5 vs Bose QC45 (ANC Headphones)", ids: [26, 27] },
    { title: "Apple Watch S9 vs Galaxy Watch 6 (Smartwatches)", ids: [31, 32] }
  ];

  // Load available catalog items for the add-picker
  useEffect(() => {
    const loadCatalog = async () => {
      try {
        const data = await getProducts();
        setAvailableProducts(data || []);
      } catch (e) {
        console.error(e);
      }
    };
    loadCatalog();
  }, []);

  // Determine active product IDs from query params or context
  useEffect(() => {
    const p1 = searchParams.get('p1');
    const p2 = searchParams.get('p2');

    let ids = [];
    if (p1 && p2) {
      ids = [parseInt(p1), parseInt(p2)];
    } else if (p1) {
      // Find an alternative from same category
      ids = [parseInt(p1)];
    } else if (compareItems.length > 0) {
      ids = compareItems.map(p => p.id);
    } else {
      // Default to HP Victus & Lenovo LOQ
      ids = [1, 2];
    }

    fetchComparison(ids);
  }, [compareItems, searchParams]);

  const fetchComparison = async (ids) => {
    if (!ids || ids.length === 0) return;
    setLoading(true);
    try {
      const result = await compareProducts(ids);
      setComparisonData(result);
      setProductsToCompare(result.products || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyPreset = (presetIds) => {
    fetchComparison(presetIds);
  };

  const handleAddProduct = (e) => {
    e.preventDefault();
    if (!selectedToAdd) return;
    const pid = parseInt(selectedToAdd);
    if (productsToCompare.some(p => p.id === pid)) return;
    if (productsToCompare.length >= 4) return;

    const newIds = [...productsToCompare.map(p => p.id), pid];
    fetchComparison(newIds);
    setSelectedToAdd('');
  };

  const handleRemoveItem = (idToRemove) => {
    const newProducts = productsToCompare.filter(p => p.id !== idToRemove);
    if (newProducts.length === 0) {
      setProductsToCompare([]);
      setComparisonData(null);
    } else {
      fetchComparison(newProducts.map(p => p.id));
    }
    removeFromCompare(idToRemove);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Scale className="w-7 h-7 text-indigo-400" />
            <span>Product Comparison Matrix</span>
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Side-by-side technical specification analysis with AI-grounded verdict.
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[11px] text-slate-500 font-medium shrink-0">Presets:</span>
          {presets.map((pr, i) => (
            <button
              key={i}
              onClick={() => handleApplyPreset(pr.ids)}
              className="text-xs px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 whitespace-nowrap transition-colors"
            >
              {pr.title.split(' (')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Product Selection Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <form onSubmit={handleAddProduct} className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedToAdd}
            onChange={(e) => setSelectedToAdd(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl p-2.5 focus:outline-none focus:border-indigo-500 w-full sm:w-72"
            disabled={productsToCompare.length >= 4}
          >
            <option value="">+ Add product to comparison...</option>
            {availableProducts
              .filter(p => !productsToCompare.some(cp => cp.id === p.id))
              .map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} (₹{p.price.toLocaleString('en-IN')})
                </option>
              ))}
          </select>
          <button
            type="submit"
            disabled={!selectedToAdd || productsToCompare.length >= 4}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-semibold rounded-xl shrink-0 transition-colors"
          >
            Add
          </button>
        </form>

        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span>Comparing <strong>{productsToCompare.length}</strong> of 4 max</span>
          {productsToCompare.length > 0 && (
            <button
              onClick={() => {
                setProductsToCompare([]);
                setComparisonData(null);
                clearCompare();
              }}
              className="text-slate-400 hover:text-rose-400 transition-colors"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="glass-card rounded-2xl p-16 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
        </div>
      ) : comparisonData && productsToCompare.length > 0 ? (
        <div className="space-y-8">
          {/* AI Verdict & Pros/Cons Section */}
          <div className="glass-panel p-6 rounded-3xl border border-indigo-500/30 space-y-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                <Trophy className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <span>AI Comparison Verdict</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">
                    Factual Analysis
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  Calculated based on price-to-performance ratio and customer reviews.
                </p>
              </div>
            </div>

            {/* Verdict Text */}
            <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 text-xs sm:text-sm text-slate-200 leading-relaxed">
              {comparisonData.verdict}
            </div>

            {/* Pros & Cons Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {productsToCompare.map((p) => {
                const pc = comparisonData.pros_cons[p.id] || { pros: [], cons: [] };
                const isWinner = comparisonData.winner_id === p.id;
                return (
                  <div
                    key={p.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      isWinner
                        ? 'bg-indigo-950/40 border-indigo-500/50 shadow-lg shadow-indigo-950/50'
                        : 'bg-slate-900/60 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold text-xs text-white truncate max-w-[150px]">
                        {p.name}
                      </div>
                      {isWinner && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Top Value
                        </span>
                      )}
                    </div>

                    <div className="text-sm font-bold text-indigo-400 mb-3">
                      ₹{p.price.toLocaleString('en-IN')}
                    </div>

                    {/* Pros */}
                    <div className="space-y-1.5 text-xs text-slate-300 mb-3">
                      {pc.pros.map((pro, i) => (
                        <div key={i} className="flex items-start gap-1.5 text-[11px] text-emerald-300">
                          <Check className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-400" />
                          <span>{pro}</span>
                        </div>
                      ))}
                    </div>

                    {/* Cons */}
                    {pc.cons.length > 0 && (
                      <div className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-slate-800">
                        {pc.cons.map((con, i) => (
                          <div key={i} className="flex items-start gap-1.5 text-[11px] text-slate-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500/80 shrink-0 mt-1.5" />
                            <span>{con}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Side-by-Side Comparison Table */}
          <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/80">
                    <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider w-44">
                      Specification
                    </th>
                    {productsToCompare.map((p) => (
                      <th key={p.id} className="p-4 min-w-[220px]">
                        <div className="space-y-3">
                          <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-slate-950">
                            <img
                              src={p.image_url}
                              alt={p.name}
                              className="w-full h-full object-cover"
                            />
                            <button
                              onClick={() => handleRemoveItem(p.id)}
                              className="absolute top-2 right-2 p-1 rounded-full bg-slate-950/80 text-slate-400 hover:text-rose-400"
                              title="Remove"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div>
                            <Link
                              to={`/product/${p.id}`}
                              className="font-bold text-sm text-white hover:text-indigo-400 line-clamp-1 transition-colors"
                            >
                              {p.name}
                            </Link>
                            <div className="text-base font-extrabold text-indigo-400 mt-1">
                              ₹{p.price.toLocaleString('en-IN')}
                            </div>
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs sm:text-sm">
                  {Object.entries(comparisonData.comparison_table).map(([specKey, rowValues], rIdx) => (
                    <tr
                      key={specKey}
                      className={rIdx % 2 === 0 ? 'bg-slate-900/20' : 'bg-slate-900/40'}
                    >
                      <td className="p-4 font-semibold text-slate-300 whitespace-nowrap">
                        {specKey}
                      </td>
                      {productsToCompare.map((p) => {
                        const val = rowValues[String(p.id)] || 'N/A';
                        return (
                          <td key={p.id} className="p-4 text-slate-200">
                            {val}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-panel p-16 rounded-3xl text-center border border-slate-800 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mx-auto">
            <Scale className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-white">No Products Selected for Comparison</h2>
          <p className="text-slate-400 text-xs max-w-md mx-auto">
            Select products from the catalog or choose one of our curated presets above to compare specs and read AI verdicts.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => handleApplyPreset([1, 2])}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
            >
              Compare HP Victus vs Lenovo LOQ
            </button>
            <Link
              to="/catalog"
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
            >
              Browse Catalog
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComparisonPage;
