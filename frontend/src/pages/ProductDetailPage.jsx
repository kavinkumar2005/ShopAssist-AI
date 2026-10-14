import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Star, Cpu, HardDrive, Battery, Monitor, Scale, 
  Check, Plus, Sparkles, Send, Bot, ShieldCheck, 
  ArrowLeft, CheckCircle2, ChevronRight 
} from 'lucide-react';
import { getProductById, getSimilarProducts, sendChatMessage } from '../services/api';
import { useComparison } from '../context/ComparisonContext';
import ProductCard from '../components/ProductCard';

export const ProductDetailPage = () => {
  const { id } = useParams();
  const productId = parseInt(id);
  const { addToCompare, removeFromCompare, isInCompare } = useComparison();
  const compared = isInCompare(productId);

  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Embedded Q&A chat state
  const [qaQuestion, setQaQuestion] = useState('');
  const [qaMessages, setQaMessages] = useState([]);
  const [qaLoading, setQaLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const prod = await getProductById(productId);
        setProduct(prod);

        // Reset Q&A greeting with product name
        setQaMessages([
          {
            role: 'assistant',
            content: `Ask me anything about the **${prod.name}**! For example: *"Is this suitable for Machine Learning?"*, *"What is the battery life?"*, or *"Can I upgrade the RAM?"*`
          }
        ]);

        // Load similar products
        const sim = await getSimilarProducts(productId);
        setSimilarProducts(sim.similar_products || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [productId]);

  const handleAskQuestion = async (e) => {
    e.preventDefault();
    if (!qaQuestion.trim() || qaLoading) return;

    const userQ = qaQuestion.trim();
    setQaMessages(prev => [...prev, { role: 'user', content: userQ }]);
    setQaQuestion('');
    setQaLoading(true);

    try {
      const response = await sendChatMessage({
        message: userQ,
        context_product_id: productId
      });

      setQaMessages(prev => [
        ...prev,
        { role: 'assistant', content: response.reply }
      ]);
    } catch (err) {
      console.error(err);
      setQaMessages(prev => [
        ...prev,
        { role: 'assistant', content: "Failed to query the AI assistant. Please try again." }
      ]);
    } finally {
      setQaLoading(false);
    }
  };

  const handleCompareToggle = () => {
    if (compared) {
      removeFromCompare(productId);
    } else if (product) {
      addToCompare(product);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Product Not Found</h2>
        <Link to="/catalog" className="text-indigo-400 text-sm hover:underline">
          Return to Catalog
        </Link>
      </div>
    );
  }

  const specRows = [
    { label: "Processor", value: product.processor, icon: Cpu },
    { label: "RAM Memory", value: product.ram, icon: Cpu },
    { label: "Storage", value: product.storage, icon: HardDrive },
    { label: "Display Screen", value: product.display, icon: Monitor },
    { label: "Battery Life", value: product.battery, icon: Battery },
    { label: "Stock Availability", value: product.stock_status, icon: CheckCircle2 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <Link to="/" className="hover:text-slate-200">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        <Link to={`/catalog?category=${encodeURIComponent(product.category)}`} className="hover:text-slate-200">
          {product.category}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        <span className="text-slate-200 font-medium truncate max-w-[200px]">
          {product.name}
        </span>
      </div>

      {/* Main Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Product Visual */}
        <div className="glass-panel p-4 rounded-3xl border border-slate-800 space-y-4">
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-900">
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 flex gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-950/80 backdrop-blur text-white border border-slate-700">
                {product.brand}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-600/80 backdrop-blur text-white">
                {product.category}
              </span>
            </div>
          </div>
        </div>

        {/* Product Info & Action */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-1 bg-amber-500/10 text-amber-400 px-2.5 py-1 rounded-lg border border-amber-500/20 text-xs font-semibold">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>{product.rating}</span>
                <span className="text-slate-400">({product.reviews_count} reviews)</span>
              </div>
              <span className="text-xs text-emerald-400 font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                {product.stock_status}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
              {product.name}
            </h1>

            <div className="text-3xl font-extrabold text-indigo-400 mt-3 tracking-tight">
              ₹{product.price.toLocaleString('en-IN')}
            </div>

            <p className="text-slate-300 text-sm leading-relaxed mt-4">
              {product.description}
            </p>
          </div>

          {/* Use Cases Pills */}
          {product.use_cases && product.use_cases.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Recommended For:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {product.use_cases.map((uc, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-xl text-xs font-medium bg-indigo-950/50 text-indigo-300 border border-indigo-700/40"
                  >
                    {uc}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-800">
            <button
              onClick={handleCompareToggle}
              className={`px-5 py-3 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all ${
                compared
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
            >
              {compared ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              <span>{compared ? 'In Comparison List' : 'Add to Compare'}</span>
            </button>

            <Link
              to={`/compare?p1=${product.id}`}
              className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 border border-slate-800 transition-colors"
            >
              <Scale className="w-4 h-4 text-indigo-400" />
              <span>Compare with Alternatives</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Specifications Table & Hardware Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Specs Table */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-400" />
            <span>Technical Specifications</span>
          </h2>
          <div className="divide-y divide-slate-800/80 text-xs sm:text-sm">
            {specRows.map((row, i) => {
              const Icon = row.icon;
              return (
                <div key={i} className="py-3 flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-2">
                    <Icon className="w-4 h-4 text-slate-500" />
                    {row.label}
                  </span>
                  <span className="font-semibold text-slate-100 text-right">
                    {row.value || 'N/A'}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Key Features List */}
          {product.features && product.features.length > 0 && (
            <div className="pt-4 border-t border-slate-800 space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Key Hardware Features:
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                {product.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Embedded Interactive AI Q&A Assistant */}
        <div className="glass-panel p-6 rounded-3xl border border-indigo-500/20 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Bot className="w-5 h-5 text-indigo-400" />
              <span>Ask AI About This Product</span>
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-medium">
              Grounded Spec Q&A
            </span>
          </div>

          <p className="text-slate-400 text-xs">
            Verify real-world compatibility, performance in specific software, or battery endurance.
          </p>

          {/* Mini Q&A Messages Stream */}
          <div className="h-64 overflow-y-auto space-y-3 pr-1 bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80">
            {qaMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0 mt-0.5">
                    <Bot className="w-3 h-3" />
                  </div>
                )}
                <div
                  className={`text-xs p-3 rounded-xl max-w-[85%] leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-tl-none'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {qaLoading && (
              <div className="flex gap-2 justify-start">
                <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0 animate-pulse">
                  <Bot className="w-3 h-3" />
                </div>
                <div className="text-xs p-3 rounded-xl bg-slate-900 text-slate-400 border border-slate-800">
                  Checking specifications...
                </div>
              </div>
            )}
          </div>

          {/* Q&A Form */}
          <form onSubmit={handleAskQuestion} className="flex gap-2">
            <input
              type="text"
              value={qaQuestion}
              onChange={(e) => setQaQuestion(e.target.value)}
              placeholder="e.g. Is this laptop good for machine learning and gaming?"
              className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={!qaQuestion.trim() || qaLoading}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-semibold transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Quick FAQ Pills */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {[
              "Is this laptop suitable for ML?",
              "What is the battery endurance?",
              "Can I run games on this?"
            ].map((q, i) => (
              <button
                key={i}
                onClick={() => setQaQuestion(q)}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900 text-slate-400 hover:text-indigo-300 border border-slate-800 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Similar Products Carousel */}
      {similarProducts.length > 0 && (
        <div className="space-y-4 pt-8 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">
                Similar Products You May Like
              </h2>
              <p className="text-slate-400 text-xs">
                Discovered through 384-dimensional vector similarity on specifications.
              </p>
            </div>
            <Link
              to={`/catalog?category=${encodeURIComponent(product.category)}`}
              className="text-xs text-indigo-400 hover:underline"
            >
              View All {product.category}
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {similarProducts.map((sp) => (
              <ProductCard key={sp.id} product={sp} compact={true} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;
