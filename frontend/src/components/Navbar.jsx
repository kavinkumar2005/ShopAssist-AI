import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Sparkles, MessageSquare, ShoppingBag, Scale, User, LayoutDashboard, Search, Menu, X } from 'lucide-react';
import { useComparison } from '../context/ComparisonContext';

export const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { compareItems } = useComparison();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [quickQuery, setQuickQuery] = useState('');

  const handleQuickSearch = (e) => {
    e.preventDefault();
    if (!quickQuery.trim()) return;
    navigate(`/catalog?q=${encodeURIComponent(quickQuery.trim())}`);
    setQuickQuery('');
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { to: '/', label: 'Home', icon: null },
    { 
      to: '/chat', 
      label: 'AI Chat', 
      icon: MessageSquare, 
      badge: 'Live' 
    },
    { to: '/catalog', label: 'Catalog', icon: ShoppingBag },
    { 
      to: '/compare', 
      label: 'Compare', 
      icon: Scale, 
      count: compareItems.length 
    },
    { to: '/dashboard', label: 'My Hub', icon: User },
    { to: '/admin', label: 'Admin', icon: LayoutDashboard },
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 fill-white/20" />
          </div>
          <div>
            <div className="font-bold text-lg text-white tracking-tight flex items-center gap-1.5">
              <span>ShopAssist</span>
              <span className="text-xs px-1.5 py-0.5 rounded-md bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold">
                AI
              </span>
            </div>
          </div>
        </Link>

        {/* Global NLP Quick Search input */}
        <form onSubmit={handleQuickSearch} className="hidden md:flex flex-1 max-w-md relative items-center">
          <input
            type="text"
            placeholder="Ask AI e.g. laptop under 60k for coding..."
            value={quickQuery}
            onChange={(e) => setQuickQuery(e.target.value)}
            className="w-full bg-slate-900/90 border border-slate-700/70 focus:border-indigo-500 rounded-full pl-10 pr-12 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
          <button
            type="submit"
            className="absolute right-1.5 px-2.5 py-1 rounded-full bg-indigo-600 hover:bg-indigo-500 text-[11px] font-semibold text-white transition-colors"
          >
            Find
          </button>
        </form>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.to;
            const Icon = link.icon;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`relative px-3.5 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                <span>{link.label}</span>
                {link.badge && (
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-indigo-500 text-white animate-pulse">
                    {link.badge}
                  </span>
                )}
                {link.count !== undefined && link.count > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-indigo-600 text-white">
                    {link.count}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Mobile menu trigger */}
        <div className="flex items-center gap-2 lg:hidden">
          <Link
            to="/compare"
            className="relative p-2 rounded-xl bg-slate-800 text-slate-300"
            title="Comparison"
          >
            <Scale className="w-4 h-4" />
            {compareItems.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-indigo-600 text-[10px] font-bold text-white flex items-center justify-center">
                {compareItems.length}
              </span>
            )}
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden glass-panel border-b border-slate-800 p-4 space-y-3">
          <form onSubmit={handleQuickSearch} className="relative flex items-center mb-3">
            <input
              type="text"
              placeholder="Search products or specs..."
              value={quickQuery}
              onChange={(e) => setQuickQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-12 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <button
              type="submit"
              className="absolute right-1.5 px-3 py-1 bg-indigo-600 text-[11px] font-semibold text-white rounded-lg"
            >
              Go
            </button>
          </form>

          <div className="grid grid-cols-2 gap-2">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to;
              const Icon = link.icon;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
                    isActive
                      ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                      : 'bg-slate-900/60 text-slate-300'
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  <span>{link.label}</span>
                  {link.count !== undefined && link.count > 0 && (
                    <span className="ml-auto px-1.5 py-0.5 rounded-full text-[10px] bg-indigo-600 text-white">
                      {link.count}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
