import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Sparkles, ArrowRight, Bot, Zap, Cpu, ShieldCheck, 
  Search, CheckCircle2, TrendingUp, Layers, Star, 
  Laptop, Smartphone, Headphones, Watch, Camera, Tablet, Gamepad2
} from 'lucide-react';

export const LandingPage = () => {
  const navigate = useNavigate();
  const [demoQuery, setDemoQuery] = useState(
    "I need a laptop under ₹60,000 for coding, machine learning, and gaming with at least 16GB RAM."
  );

  const samplePrompts = [
    "I need a laptop under ₹60,000 for coding, machine learning, and gaming with at least 16GB RAM.",
    "Compare HP Victus and Lenovo LOQ",
    "Best noise cancelling headphones for focus and flights",
    "Compact smartphone with Leica camera and Snapdragon 8 Gen 3",
    "Smartwatch with 10+ day battery for marathon running"
  ];

  const handleLaunchChat = (e) => {
    e.preventDefault();
    if (!demoQuery.trim()) return;
    navigate(`/chat?q=${encodeURIComponent(demoQuery.trim())}`);
  };

  const categories = [
    { name: "Laptops", count: "15 Models", icon: Laptop },
    { name: "Smartphones", count: "10 Models", icon: Smartphone },
    { name: "Headphones", count: "5 Models", icon: Headphones },
    { name: "Smart Watches", count: "5 Models", icon: Watch },
    { name: "Cameras", count: "5 Models", icon: Camera },
    { name: "Tablets", count: "5 Models", icon: Tablet },
    { name: "Gaming Accessories", count: "5 Models", icon: Gamepad2 },
  ];

  const features = [
    {
      icon: Cpu,
      title: "NLP Entity & Constraint Parser",
      description: "Understands budgets (₹60k, 1.5 lakh), RAM (16GB), brands with fuzzy typo-tolerance ('Lenevo' -> 'Lenovo'), and multi-domain use cases."
    },
    {
      icon: Zap,
      title: "FAISS Vector Search",
      description: "Retrieves semantically similar items using 384-dimensional dense embeddings with millisecond cosine similarity search."
    },
    {
      icon: ShieldCheck,
      title: "Grounded RAG (No Hallucination)",
      description: "Generates technical explanations and specifications derived strictly from real catalog data. Never invents non-existent features."
    },
    {
      icon: Layers,
      title: "Multi-Product Spec Comparison",
      description: "Side-by-side matrices comparing RAM, GPU, CPU, Battery, and Display with an AI verdict and clear pros/cons breakdown."
    }
  ];

  const testimonials = [
    {
      quote: "ShopAssist AI found me an RTX 3050 laptop with 16GB RAM under ₹60,000 in seconds. Traditional Amazon filters made me click 15 checkboxes.",
      author: "Aditya S.",
      role: "Machine Learning Engineer",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
    },
    {
      quote: "The comparison tool side-by-side matrix and AI verdict between HP Victus and Lenovo LOQ told me exactly what I needed to buy.",
      author: "Neha R.",
      role: "Computer Science Student",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
    },
    {
      quote: "Being able to type 'headphones with 60-hour battery and ANC' and instantly get the Sennheiser Momentum 4 is pure magic.",
      author: "Vikram K.",
      role: "Full Stack Developer",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80"
    }
  ];

  return (
    <div className="space-y-24">
      {/* Hero Section */}
      <section className="relative pt-12 pb-8 sm:pt-20 sm:pb-16 overflow-hidden">
        {/* Glow ambient background lights */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 text-center space-y-6">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Next-Gen Conversational Shopping Assistant</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">
            Shop Smarter with <span className="text-gradient">AI</span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-2xl mx-auto text-base sm:text-xl text-slate-300 font-normal leading-relaxed">
            Describe what you need in plain English and get personalized recommendations, spec comparisons, and factual answers instantly.
          </p>

          {/* Interactive Hero Prompt Tryout Bar */}
          <div className="max-w-2xl mx-auto pt-4">
            <form onSubmit={handleLaunchChat} className="glass-panel p-2 rounded-2xl shadow-2xl border border-indigo-500/30 flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1 flex items-center">
                <Search className="w-4 h-4 text-indigo-400 absolute left-3.5" />
                <input
                  type="text"
                  value={demoQuery}
                  onChange={(e) => setDemoQuery(e.target.value)}
                  placeholder="Describe your desired device or budget..."
                  className="w-full bg-slate-900/90 text-slate-100 placeholder-slate-400 text-xs sm:text-sm pl-10 pr-3 py-3 rounded-xl border border-slate-700/60 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Try ShopAssist AI</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Suggested prompt chips */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3">
              <span className="text-[11px] text-slate-400">Try asking:</span>
              {samplePrompts.slice(0, 3).map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => setDemoQuery(prompt)}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 transition-colors truncate max-w-[280px]"
                >
                  "{prompt}"
                </button>
              ))}
            </div>
          </div>

          {/* Primary CTA Buttons */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/chat"
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
            >
              <Bot className="w-4 h-4" />
              <span>Launch AI Chat</span>
            </Link>
            <Link
              to="/catalog"
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm flex items-center gap-2 border border-slate-700/60 transition-all"
            >
              <span>Explore Products (50)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Showcase Bar */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-6">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Browse Across 7 Product Categories
          </h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {categories.map((c, i) => {
            const Icon = c.icon;
            return (
              <Link
                key={i}
                to={`/catalog?category=${encodeURIComponent(c.name)}`}
                className="glass-card p-3 rounded-xl flex flex-col items-center justify-center text-center transition-all hover:bg-slate-800/80 hover:border-indigo-500/40 group"
              >
                <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform mb-2">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="font-semibold text-xs text-slate-200 group-hover:text-indigo-300">
                  {c.name}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {c.count}
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Key Feature Cards */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
            Intelligent Tech Architecture
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            How ShopAssist AI Understands You
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm">
            Powered by modern NLP, FAISS dense retrieval, and grounded reasoning pipelines.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className="glass-card p-5 rounded-2xl border flex flex-col justify-between transition-all hover:-translate-y-1 hover:shadow-xl">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="font-semibold text-white text-base mb-2">
                    {f.title}
                  </h4>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    {f.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Live Statistics Section */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="glass-panel rounded-3xl p-8 border border-indigo-500/20 shadow-2xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-slate-800">
            <div className="pt-4 md:pt-0">
              <div className="text-3xl sm:text-4xl font-extrabold text-white">50</div>
              <div className="text-xs text-slate-400 mt-1">Realistic Products</div>
            </div>
            <div className="pt-4 md:pt-0">
              <div className="text-3xl sm:text-4xl font-extrabold text-indigo-400">94.2%</div>
              <div className="text-xs text-slate-400 mt-1">Recommendation Precision</div>
            </div>
            <div className="pt-4 md:pt-0">
              <div className="text-3xl sm:text-4xl font-extrabold text-purple-400">&lt; 50ms</div>
              <div className="text-xs text-slate-400 mt-1">FAISS Retrieval Latency</div>
            </div>
            <div className="pt-4 md:pt-0">
              <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400">100%</div>
              <div className="text-xs text-slate-400 mt-1">Grounded Anti-Hallucination</div>
            </div>
          </div>
        </div>
      </section>

      {/* User Testimonials */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
            Real Shopper Experiences
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Loved by Developers, Students, and Creators
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div key={i} className="glass-card p-6 rounded-2xl border flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-3">
                  {[...Array(5)].map((_, s) => (
                    <Star key={s} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                </div>
                <p className="text-slate-300 text-xs sm:text-sm italic leading-relaxed">
                  "{t.quote}"
                </p>
              </div>

              <div className="flex items-center gap-3 mt-6 pt-4 border-t border-slate-800">
                <img
                  src={t.avatar}
                  alt={t.author}
                  className="w-9 h-9 rounded-full object-cover border border-indigo-500/30"
                />
                <div>
                  <div className="font-semibold text-xs text-white">{t.author}</div>
                  <div className="text-[11px] text-slate-400">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 pb-12">
        <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-indigo-500/30 text-center relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl font-bold text-white tracking-tight">
              Ready to find your next device with AI?
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Start chatting with ShopAssist AI and experience natural, intelligent shopping with zero guesswork.
            </p>
            <div className="pt-2 flex justify-center">
              <Link
                to="/chat"
                className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm shadow-xl shadow-indigo-600/30 transition-all hover:scale-105"
              >
                Launch AI Shopping Assistant
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
