import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, Filter, SlidersHorizontal, Grid, List, 
  RotateCcw, Sparkles, AlertCircle 
} from 'lucide-react';
import { searchProducts, getProducts } from '../services/api';
import ProductCard from '../components/ProductCard';

export const CatalogPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlQuery = searchParams.get('q') || '';
  const urlCategory = searchParams.get('category') || '';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(urlQuery);
  const [selectedCategory, setSelectedCategory] = useState(urlCategory);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [minRam, setMinRam] = useState('');
  const [selectedUseCase, setSelectedUseCase] = useState('');
  const [maxPrice, setMaxPrice] = useState(250000);
  const [sortBy, setSortBy] = useState('relevance');
  const [searchMode, setSearchMode] = useState('hybrid');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [extractedInfo, setExtractedInfo] = useState(null);

  const categories = [
    'All', 'Laptops', 'Smartphones', 'Headphones',
    'Smart Watches', 'Cameras', 'Tablets', 'Gaming Accessories'
  ];

  const brands = [
    'Apple', 'Samsung', 'Lenovo', 'HP', 'ASUS', 'Dell', 'Acer',
    'OnePlus', 'Sony', 'Bose', 'Canon', 'Xiaomi', 'Razer', 'Logitech'
  ];

  const useCases = [
    'Coding', 'Machine Learning', 'Gaming', 'Photography', 'Office', 'College', 'Fitness'
  ];

  const fetchCatalog = async () => {
    setLoading(true);
    try {
      if (query.trim()) {
        const response = await searchProducts({
          query: query.trim(),
          category: selectedCategory && selectedCategory !== 'All' ? selectedCategory : undefined,
          brand: selectedBrand || undefined,
          min_ram: minRam ? parseInt(minRam) : undefined,
          max_price: maxPrice ? parseInt(maxPrice) : undefined,
          use_case: selectedUseCase || undefined,
          sort_by: sortBy,
          mode: searchMode
        });
        setProducts(response.results || []);
        setExtractedInfo(response.extracted_constraints || null);
      } else {
        const data = await getProducts({
          category: selectedCategory && selectedCategory !== 'All' ? selectedCategory : undefined,
          brand: selectedBrand || undefined,
          max_price: maxPrice,
          sort_by: sortBy
        });
        setProducts(data || []);
        setExtractedInfo(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, [selectedCategory, selectedBrand, minRam, selectedUseCase, maxPrice, sortBy, searchMode]);

  // Sync state if URL search params change
  useEffect(() => {
    if (urlQuery !== query) {
      setQuery(urlQuery);
    }
    if (urlCategory !== selectedCategory) {
      setSelectedCategory(urlCategory);
    }
  }, [urlQuery, urlCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCatalog();
  };

  const handleResetFilters = () => {
    setQuery('');
    setSelectedCategory('All');
    setSelectedBrand('');
    setMinRam('');
    setSelectedUseCase('');
    setMaxPrice(250000);
    setSortBy('relevance');
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Explore Product Catalog
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Search with keywords, natural language questions, or refine using spec filters.
          </p>
        </div>

        {/* View Mode & Count */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 font-medium bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
            Showing <strong className="text-white">{products.length}</strong> items
          </span>

          <div className="flex items-center bg-slate-900 rounded-xl border border-slate-800 p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs ${
                viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs ${
                viewMode === 'list' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar & Search Mode Selection */}
      <div className="glass-panel p-3 rounded-2xl border border-slate-800 space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search or describe: e.g. laptop under 60k for machine learning with 16GB RAM..."
              className="w-full bg-slate-900 border border-slate-700/70 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={searchMode}
              onChange={(e) => setSearchMode(e.target.value)}
              className="bg-slate-900 border border-slate-700/70 text-slate-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-500"
            >
              <option value="hybrid">Mode: Hybrid Search (Vector + Keyword)</option>
              <option value="semantic">Mode: Pure Semantic (FAISS Vector)</option>
              <option value="keyword">Mode: Pure Keyword</option>
            </select>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors shrink-0 shadow-md shadow-indigo-600/30"
            >
              Search
            </button>
          </div>
        </form>

        {/* NLP Extracted constraints banner if active query */}
        {extractedInfo && (extractedInfo.budget || extractedInfo.ram || extractedInfo.category) && (
          <div className="bg-indigo-950/40 border border-indigo-500/20 rounded-xl p-2.5 flex flex-wrap items-center gap-2 text-xs">
            <span className="font-semibold text-indigo-300 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> NLP Understanding:
            </span>
            {extractedInfo.category && (
              <span className="bg-indigo-900/60 text-indigo-200 px-2 py-0.5 rounded-md border border-indigo-700/40">
                Category: {extractedInfo.category}
              </span>
            )}
            {extractedInfo.budget && (
              <span className="bg-indigo-900/60 text-indigo-200 px-2 py-0.5 rounded-md border border-indigo-700/40">
                Budget: ₹{extractedInfo.budget.toLocaleString('en-IN')}
              </span>
            )}
            {extractedInfo.ram && (
              <span className="bg-indigo-900/60 text-indigo-200 px-2 py-0.5 rounded-md border border-indigo-700/40">
                Min RAM: {extractedInfo.ram}GB
              </span>
            )}
            {extractedInfo.use_cases && extractedInfo.use_cases.length > 0 && (
              <span className="bg-indigo-900/60 text-indigo-200 px-2 py-0.5 rounded-md border border-indigo-700/40">
                Uses: {extractedInfo.use_cases.join(', ')}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => {
          const isSelected = (!selectedCategory && cat === 'All') || selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat === 'All' ? '' : cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Main Grid & Filter Sidebar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Filter Sidebar */}
        <aside className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2 font-semibold text-sm text-white">
              <Filter className="w-4 h-4 text-indigo-400" />
              <span>Filters</span>
            </div>
            <button
              onClick={handleResetFilters}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          </div>

          {/* Sort By */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl p-2.5 focus:outline-none focus:border-indigo-500"
            >
              <option value="relevance">Relevance & Match Score</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Highest Rated (★)</option>
            </select>
          </div>

          {/* Max Price Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <span className="uppercase tracking-wider">Max Price</span>
              <span className="text-indigo-400 font-bold">
                ₹{maxPrice.toLocaleString('en-IN')}
              </span>
            </div>
            <input
              type="range"
              min="5000"
              max="250000"
              step="5000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(parseInt(e.target.value))}
              className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>₹5,000</span>
              <span>₹2,50,000</span>
            </div>
          </div>

          {/* Brand Filter */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Brand
            </label>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl p-2.5 focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Brands</option>
              {brands.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Minimum RAM */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Min RAM
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {['', '8', '12', '16'].map((ramVal) => (
                <button
                  key={ramVal}
                  onClick={() => setMinRam(ramVal)}
                  className={`py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    minRam === ramVal
                      ? 'bg-indigo-600 text-white border-indigo-500'
                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {ramVal ? `${ramVal}GB` : 'Any'}
                </button>
              ))}
            </div>
          </div>

          {/* Primary Use Case */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Primary Use Case
            </label>
            <div className="flex flex-wrap gap-1.5">
              {useCases.map((uc) => {
                const isSelected = selectedUseCase === uc;
                return (
                  <button
                    key={uc}
                    onClick={() => setSelectedUseCase(isSelected ? '' : uc)}
                    className={`px-2.5 py-1 rounded-lg text-xs transition-colors ${
                      isSelected
                        ? 'bg-indigo-600 text-white font-semibold'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {uc}
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Product Grid Results */}
        <div className="lg:col-span-3 space-y-4">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="glass-card rounded-2xl h-80 animate-pulse bg-slate-900/60" />
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className={
              viewMode === 'grid'
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                : "flex flex-col gap-3"
            }>
              {products.map((p) => (
                <ProductCard key={p.id} product={p} compact={viewMode === 'list'} />
              ))}
            </div>
          ) : (
            <div className="glass-panel p-12 rounded-2xl text-center border border-slate-800 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">No products found</h3>
              <p className="text-slate-400 text-xs sm:text-sm max-w-md mx-auto">
                We couldn't find any products matching your active filters. Try broadening your budget or clearing filters.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CatalogPage;
