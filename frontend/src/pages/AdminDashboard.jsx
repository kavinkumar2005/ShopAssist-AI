import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, ShoppingBag, BarChart3, TrendingUp, 
  DollarSign, Scale, Plus, Trash2, Edit3, Check, 
  Search, Shield, RefreshCw, X, AlertCircle 
} from 'lucide-react';
import { 
  getAnalyticsData, getProducts, createProduct, 
  updateProduct, deleteProduct 
} from '../services/api';
import AnalyticsCard from '../components/AnalyticsCard';

export const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics' | 'inventory'
  const [searchFilter, setSearchFilter] = useState('');

  // Add Product Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    brand: '',
    category: 'Laptops',
    price: 55000,
    ram: '16GB',
    storage: '512GB SSD',
    processor: 'Intel Core i5',
    battery: '54Wh',
    display: '15.6-inch FHD 144Hz',
    rating: 4.5,
    reviews_count: 10,
    description: '',
    image_url: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80',
    features: ['16GB RAM', 'Backlit Keyboard', 'Fast Charging'],
    use_cases: ['Coding', 'Gaming'],
    stock_status: 'In Stock'
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, productsRes] = await Promise.all([
        getAnalyticsData(),
        getProducts()
      ]);
      setAnalytics(analyticsRes);
      setProducts(productsRes || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStockToggle = async (product) => {
    const nextStatus = product.stock_status === 'In Stock' ? 'Out of Stock' : 'In Stock';
    try {
      await updateProduct(product.id, { stock_status: nextStatus });
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, stock_status: nextStatus } : p));
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await deleteProduct(productId);
      setProducts(prev => prev.filter(p => p.id !== productId));
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      const created = await createProduct(newProduct);
      if (created) {
        setProducts(prev => [created, ...prev]);
        setShowAddModal(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    p.brand.toLowerCase().includes(searchFilter.toLowerCase()) ||
    p.category.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Shield className="w-7 h-7 text-indigo-400" />
            <span>Admin Management & Analytics</span>
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Real-time search trends, inventory management, and NLP recommendation performance.
          </p>
        </div>

        {/* Action Tabs */}
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                activeTab === 'analytics'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Analytics & Trends</span>
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                activeTab === 'inventory'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Inventory ({products.length})</span>
            </button>
          </div>

          <button
            onClick={loadData}
            className="p-2 rounded-xl bg-slate-900 text-slate-300 hover:text-white border border-slate-800"
            title="Refresh data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="glass-card rounded-2xl p-16 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
        </div>
      ) : activeTab === 'analytics' ? (
        <div className="space-y-8">
          {/* Metrics Tiles Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <AnalyticsCard
              title="Total Products"
              value={analytics?.total_products || products.length}
              subtitle="7 active categories"
              icon={ShoppingBag}
              color="indigo"
            />
            <AnalyticsCard
              title="Average Target Budget"
              value={`₹${(analytics?.average_searched_budget || 62500).toLocaleString('en-IN')}`}
              subtitle="Extracted via NLP"
              icon={DollarSign}
              color="emerald"
            />
            <AnalyticsCard
              title="Recommendation Success"
              value={`${analytics?.recommendation_success_rate || 94.2}%`}
              subtitle="Precision on grounded specs"
              icon={TrendingUp}
              color="purple"
            />
            <AnalyticsCard
              title="Active Comparisons"
              value={analytics?.most_compared_products?.reduce((acc, c) => acc + c.compares, 0) || 48}
              subtitle="Comparison queries"
              icon={Scale}
              color="amber"
            />
          </div>

          {/* Charts & Trends Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Category Search Volume & Distribution Chart */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-indigo-400" />
                  <span>Most Searched Categories</span>
                </h3>
                <span className="text-[11px] text-slate-400">Search Frequency</span>
              </div>

              <div className="space-y-3 pt-2">
                {(analytics?.most_searched_categories || []).map((cat, i) => {
                  const maxVal = Math.max(...(analytics?.most_searched_categories || []).map(c => c.searches), 1);
                  const percentage = Math.round((cat.searches / maxVal) * 100);
                  return (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-slate-300">{cat.category}</span>
                        <span className="text-indigo-400 font-semibold">{cat.searches} queries</span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-800">
                        <div
                          className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Most Compared Products */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <Scale className="w-4 h-4 text-purple-400" />
                  <span>Most Compared Products</span>
                </h3>
                <span className="text-[11px] text-slate-400">Head-to-Head</span>
              </div>

              <div className="divide-y divide-slate-800/80">
                {(analytics?.most_compared_products || []).map((prod, i) => (
                  <div key={i} className="py-2.5 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-xs text-white">
                        {prod.name}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Category: {prod.category}
                      </div>
                    </div>
                    <span className="text-xs font-bold text-indigo-400 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                      {prod.compares} compares
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Search Queries NLP Stream */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Real-Time Natural Language Queries & Constraints</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-2 px-3">User Query</th>
                    <th className="py-2 px-3">Intent</th>
                    <th className="py-2 px-3">Category</th>
                    <th className="py-2 px-3">Extracted Budget</th>
                    <th className="py-2 px-3">Matches</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {(analytics?.recent_searches || []).map((s, i) => (
                    <tr key={i} className="hover:bg-slate-900/40">
                      <td className="py-2.5 px-3 font-medium text-slate-200">"{s.query}"</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-900 border border-slate-800 text-slate-300">
                          {s.intent || 'Search'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-400">{s.category || 'Any'}</td>
                      <td className="py-2.5 px-3 text-indigo-400 font-semibold">
                        {s.extracted_budget ? `₹${s.extracted_budget.toLocaleString('en-IN')}` : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-slate-300">{s.results_count || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Inventory Management Tab */
        <div className="space-y-6">
          {/* Inventory Controls */}
          <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 w-full sm:w-auto">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search inventory by name, brand, category..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 shadow-md shadow-indigo-600/30"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </button>
          </div>

          {/* Products Table */}
          <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900 text-slate-400 uppercase text-[11px] tracking-wider">
                    <th className="p-4">Product</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">RAM / Specs</th>
                    <th className="p-4">Stock Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="p-4 flex items-center gap-3">
                        <img
                          src={p.image_url}
                          alt={p.name}
                          className="w-10 h-10 rounded-lg object-cover bg-slate-900"
                        />
                        <div>
                          <div className="font-semibold text-white">{p.name}</div>
                          <div className="text-slate-400 text-xs">{p.brand}</div>
                        </div>
                      </td>
                      <td className="p-4 text-slate-300">{p.category}</td>
                      <td className="p-4 font-bold text-indigo-400">
                        ₹{p.price.toLocaleString('en-IN')}
                      </td>
                      <td className="p-4 text-slate-400">
                        {p.ram && p.ram !== 'N/A' ? `${p.ram} | ${p.processor}` : p.processor}
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => handleStockToggle(p)}
                          className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                            p.stock_status === 'In Stock'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20'
                          }`}
                        >
                          {p.stock_status}
                        </button>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-lg p-6 rounded-3xl border border-slate-700 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base text-white">Add New Product</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  placeholder="e.g. Dell Inspiron 16 Plus"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Brand</label>
                  <input
                    type="text"
                    required
                    value={newProduct.brand}
                    onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                    placeholder="e.g. Dell"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Category</label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    {['Laptops', 'Smartphones', 'Headphones', 'Smart Watches', 'Cameras', 'Tablets', 'Gaming Accessories'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: parseInt(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">RAM</label>
                  <input
                    type="text"
                    value={newProduct.ram}
                    onChange={(e) => setNewProduct({ ...newProduct, ram: e.target.value })}
                    placeholder="e.g. 16GB"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Processor</label>
                  <input
                    type="text"
                    value={newProduct.processor}
                    onChange={(e) => setNewProduct({ ...newProduct, processor: e.target.value })}
                    placeholder="e.g. Intel Core i7"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Storage</label>
                  <input
                    type="text"
                    value={newProduct.storage}
                    onChange={(e) => setNewProduct({ ...newProduct, storage: e.target.value })}
                    placeholder="e.g. 512GB SSD"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Description</label>
                <textarea
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  placeholder="Key product highlights..."
                  rows={2}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
                >
                  Create Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
