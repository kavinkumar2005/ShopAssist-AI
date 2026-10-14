import React, { createContext, useContext, useState, useEffect } from 'react';

const ComparisonContext = createContext();

export const ComparisonProvider = ({ children }) => {
  const [compareItems, setCompareItems] = useState(() => {
    try {
      const saved = localStorage.getItem('shopassist_compare');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [notification, setNotification] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem('shopassist_compare', JSON.stringify(compareItems));
    } catch (e) {
      console.error(e);
    }
  }, [compareItems]);

  const showNotice = (msg, type = 'info') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const addToCompare = (product) => {
    if (compareItems.find(p => p.id === product.id)) {
      showNotice(`${product.name} is already in comparison`, 'warning');
      return false;
    }
    if (compareItems.length >= 4) {
      showNotice('You can compare up to 4 products at a time', 'warning');
      return false;
    }
    setCompareItems(prev => [...prev, product]);
    showNotice(`Added ${product.name} to comparison`, 'success');
    return true;
  };

  const removeFromCompare = (productId) => {
    setCompareItems(prev => prev.filter(p => p.id !== productId));
  };

  const clearCompare = () => {
    setCompareItems([]);
  };

  const isInCompare = (productId) => {
    return compareItems.some(p => p.id === productId);
  };

  return (
    <ComparisonContext.Provider value={{
      compareItems,
      addToCompare,
      removeFromCompare,
      clearCompare,
      isInCompare,
      notification
    }}>
      {children}
    </ComparisonContext.Provider>
  );
};

export const useComparison = () => useContext(ComparisonContext);
