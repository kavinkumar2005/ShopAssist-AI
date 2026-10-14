import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUserPreferences, saveUserPreferences } from '../services/api';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userId] = useState('default_user');
  const [preferences, setPreferences] = useState({
    user_id: 'default_user',
    preferred_categories: ['Laptops', 'Smartphones'],
    preferred_brands: ['HP', 'Lenovo', 'Apple'],
    min_budget: 30000,
    max_budget: 85000,
    preferred_use_cases: ['Coding', 'Machine Learning', 'Gaming'],
    search_history: ['laptop under 60000', 'coding laptop 16gb ram']
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPrefs = async () => {
      try {
        const data = await getUserPreferences(userId);
        if (data) setPreferences(data);
      } catch (err) {
        console.warn("Using offline user preferences state:", err.message);
      }
    };
    fetchPrefs();
  }, [userId]);

  const updatePreferences = async (newPrefs) => {
    setLoading(true);
    try {
      const merged = { ...preferences, ...newPrefs, user_id: userId };
      const updated = await saveUserPreferences(merged);
      setPreferences(updated);
    } catch (err) {
      console.error("Error updating preferences:", err);
      setPreferences(prev => ({ ...prev, ...newPrefs }));
    } finally {
      setLoading(false);
    }
  };

  const addSearchHistory = async (query) => {
    if (!query || preferences.search_history.includes(query)) return;
    const newHistory = [query, ...preferences.search_history.slice(0, 9)];
    await updatePreferences({ search_history: newHistory });
  };

  return (
    <UserContext.Provider value={{
      userId,
      preferences,
      updatePreferences,
      addSearchHistory,
      loading
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
