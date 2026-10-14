import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ComparisonDrawer from './components/ComparisonDrawer';
import { ComparisonProvider } from './context/ComparisonContext';
import { UserProvider } from './context/UserContext';

// Pages
import LandingPage from './pages/LandingPage';
import ChatPage from './pages/ChatPage';
import CatalogPage from './pages/CatalogPage';
import ProductDetailPage from './pages/ProductDetailPage';
import ComparisonPage from './pages/ComparisonPage';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';

export function App() {
  return (
    <UserProvider>
      <ComparisonProvider>
        <Router>
          <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/chat" element={<ChatPage />} />
                <Route path="/catalog" element={<CatalogPage />} />
                <Route path="/product/:id" element={<ProductDetailPage />} />
                <Route path="/compare" element={<ComparisonPage />} />
                <Route path="/dashboard" element={<UserDashboard />} />
                <Route path="/admin" element={<AdminDashboard />} />
              </Routes>
            </main>
            <Footer />
            <ComparisonDrawer />
          </div>
        </Router>
      </ComparisonProvider>
    </UserProvider>
  );
}

export default App;
