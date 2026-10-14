import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Shield, Cpu, Zap, Code2, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="glass-panel border-t border-slate-800/80 mt-20 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-bold text-base text-white">ShopAssist AI</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-xs">
              The next-generation AI e-commerce shopping copilot powered by FAISS, Sentence Transformers, and grounded RAG reasoning.
            </p>
            <div className="flex items-center gap-3 pt-2 text-slate-500">
              <span className="inline-flex items-center gap-1 text-[11px] bg-slate-900 px-2 py-1 rounded border border-slate-800">
                <Cpu className="w-3 h-3 text-indigo-400" /> FAISS FlatIP
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] bg-slate-900 px-2 py-1 rounded border border-slate-800">
                <Zap className="w-3 h-3 text-amber-400" /> Fast RAG
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-slate-200 mb-3 uppercase tracking-wider text-[11px]">
              Platform
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/chat" className="hover:text-indigo-400 transition-colors">
                  AI Shopping Assistant
                </Link>
              </li>
              <li>
                <Link to="/catalog" className="hover:text-indigo-400 transition-colors">
                  Product Catalog (50 items)
                </Link>
              </li>
              <li>
                <Link to="/compare" className="hover:text-indigo-400 transition-colors">
                  Spec Comparison Matrix
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-indigo-400 transition-colors">
                  User Preferences Hub
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold text-slate-200 mb-3 uppercase tracking-wider text-[11px]">
              Categories
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/catalog?category=Laptops" className="hover:text-indigo-400 transition-colors">
                  Laptops (Coding, ML, Gaming)
                </Link>
              </li>
              <li>
                <Link to="/catalog?category=Smartphones" className="hover:text-indigo-400 transition-colors">
                  Smartphones (Flagships & Mid-range)
                </Link>
              </li>
              <li>
                <Link to="/catalog?category=Headphones" className="hover:text-indigo-400 transition-colors">
                  Headphones (ANC & Audiophile)
                </Link>
              </li>
              <li>
                <Link to="/catalog?category=Cameras" className="hover:text-indigo-400 transition-colors">
                  Mirrorless Cameras & Lenses
                </Link>
              </li>
              <li>
                <Link to="/catalog?category=Smart%20Watches" className="hover:text-indigo-400 transition-colors">
                  Smart Watches & Fitness Bands
                </Link>
              </li>
            </ul>
          </div>

          {/* System & Architecture */}
          <div>
            <h4 className="font-semibold text-slate-200 mb-3 uppercase tracking-wider text-[11px]">
              AI Architecture
            </h4>
            <div className="space-y-2 text-slate-400 text-xs">
              <p>• Sentence Transformers (all-MiniLM-L6-v2)</p>
              <p>• FAISS Vector Similarity Index</p>
              <p>• Multi-technique NLP Query Parser</p>
              <p>• Strict Anti-Hallucination Guardrails</p>
              <div className="pt-2">
                <Link
                  to="/admin"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors text-xs"
                >
                  <Shield className="w-3.5 h-3.5 text-indigo-400" />
                  Admin Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 mt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} ShopAssist AI Inc. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> for intelligent e-commerce shopping.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
