import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  User, Settings, History, Sparkles, Heart, 
  Save, Check, Search, ArrowRight, ShieldCheck 
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import { getPersonalizedFeed } from '../services/api';
import ProductCard from '../components/ProductCard';

export const UserDashboard = () => {
  const { preferences, updatePreferences, loading: saving } = useUser();
  const [personalizedItems, setPersonalizedItems] = useState([]);
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [savedNotice, setSavedNotice] = useState(false);

  // Local form state
  const [minBudget, setMinBudget] = useState(preferences.min_budget || 0);
  const [maxBudget, setMaxBudget] = useState(preferences.max_budget || 85000);
  const [selectedBrands, setSelectedBrands] = useState(preferences.preferred_brands || []);
  const [selectedCategories, setSelectedCategories] = useState(preferences.preferred_categories || []);
  const [selectedUseCases, setSelectedUseCases] = useState(preferences.preferred_use_cases || []);

  const allBrands = ['Apple', 'Samsung', 'Lenovo', 'HP', 'ASUS', 'Dell', 'Sony', 'OnePlus', 'Bose', 'Canon', 'Xiaomi'];
  const allCategories = ['Laptops', 'Smartphones', 'Headphones', 'Smart Watches', 'Cameras', 'Tablets', 'Gaming Accessories'];
  const allUseCases = ['Coding', 'Machine Learning', 'Gaming', 'Photography', 'Office', 'College', 'Fitness'];

  useEffect(() => {
    if (preferences) {
      setMinBudget(preferences.min_budget || 0);
      setMaxBudget(preferences.max_budget || 85000);
      setSelectedBrands(preferences.preferred_brands || []);
      setSelectedCategories(preferences.preferred_categories || []);
      setSelectedUseCases(preferences.preferred_use_cases || []);
    }
  }, [preferences]);

  const loadFeed = async () => {
    setLoadingFeed(true);
    try {
      const data = await getPersonalizedFeed('default_user');
      setPersonalizedItems(data.products || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingFeed(false);
    }
  };

  useEffect(() => {
    loadFeed();
  }, [preferences]);

  const handleSavePreferences = async (e) => {
    e.preventDefault();
    await updatePreferences({
      min_budget: minBudget,
      max_budget: maxBudget,
      preferred_brands: selectedBrands,
      preferred_categories: selectedCategories,
      preferred_use_cases: selectedUseCases,
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
    loadFeed();
  };

  const toggleArrayItem = (list, setList, item) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Header Profile Tile */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-indigo-600/30">
            <User className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white">Shopper Profile & AI Preferences</h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">
                Active Member
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Personalize recommendations, monitor recent search queries, and calibrate the AI.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/chat"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-md shadow-indigo-600/20"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Chat Assistant</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Editable Preferences Form */}
        <div className="lg:col-span-1 glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2 font-bold text-sm text-white">
              <Settings className="w-4 h-4 text-indigo-400" />
              <span>Shopping Preferences</span>
            </div>
            {savedNotice && (
              <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Saved!
              </span>
            )}
          </div>

          <form onSubmit={handleSavePreferences} className="space-y-5">
            {/* Budget Range */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-300">
                <span>Maximum Target Budget</span>
                <span className="text-indigo-400 font-bold">
                  ₹{maxBudget.toLocaleString('en-IN')}
                </span>
              </div>
              <input
                type="range"
                min="10000"
                max="250000"
                step="5000"
                value={maxBudget}
                onChange={(e) => setMaxBudget(parseInt(e.target.value))}
                className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Favorite Brands */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Favorite Brands
              </label>
              <div className="flex flex-wrap gap-1.5">
                {allBrands.map((brand) => {
                  const active = selectedBrands.includes(brand);
                  return (
                    <button
                      key={brand}
                      type="button"
                      onClick={() => toggleArrayItem(selectedBrands, setSelectedBrands, brand)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                        active
                          ? 'bg-indigo-600 text-white border-indigo-500'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {brand}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Preferred Categories */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Interested Categories
              </label>
              <div className="flex flex-wrap gap-1.5">
                {allCategories.map((cat) => {
                  const active = selectedCategories.includes(cat);
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleArrayItem(selectedCategories, setSelectedCategories, cat)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                        active
                          ? 'bg-indigo-600 text-white border-indigo-500'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Preferred Use Cases */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Primary Use Cases
              </label>
              <div className="flex flex-wrap gap-1.5">
                {allUseCases.map((uc) => {
                  const active = selectedUseCases.includes(uc);
                  return (
                    <button
                      key={uc}
                      type="button"
                      onClick={() => toggleArrayItem(selectedUseCases, setSelectedUseCases, uc)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                        active
                          ? 'bg-indigo-600 text-white border-indigo-500'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {uc}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-indigo-600/30"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving Preferences...' : 'Save AI Preferences'}</span>
            </button>
          </form>

          {/* Recent Search History */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <div className="flex items-center gap-2 font-bold text-xs text-slate-300">
              <History className="w-3.5 h-3.5 text-indigo-400" />
              <span>Recent Search History</span>
            </div>
            {preferences.search_history && preferences.search_history.length > 0 ? (
              <div className="space-y-1.5">
                {preferences.search_history.map((q, i) => (
                  <Link
                    key={i}
                    to={`/chat?q=${encodeURIComponent(q)}`}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 text-slate-300 text-xs transition-colors border border-slate-800 group"
                  >
                    <span className="truncate max-w-[200px]">"{q}"</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No search history yet.</p>
            )}
          </div>
        </div>

        {/* Right Column: Personalized Feed */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <span>Personalized Recommendations For You</span>
              </h2>
              <p className="text-slate-400 text-xs mt-0.5">
                Calculated using your budget target (under ₹{maxBudget.toLocaleString('en-IN')}), favored brands, and use cases.
              </p>
            </div>
          </div>

          {loadingFeed ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="glass-card rounded-2xl h-72 animate-pulse bg-slate-900/60" />
              ))}
            </div>
          ) : personalizedItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {personalizedItems.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          ) : (
            <div className="glass-panel p-12 rounded-3xl text-center border border-slate-800 space-y-3">
              <p className="text-slate-400 text-xs">No personalized matches found for this budget. Adjust your budget slider above.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
