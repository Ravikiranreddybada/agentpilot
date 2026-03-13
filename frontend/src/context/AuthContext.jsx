import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

// Single source of truth for the API URL
const getAPI = () => {
  if (typeof window === 'undefined') return import.meta.env.VITE_API_URL || 'https://agentpilot.onrender.com';
  if (window.location.hostname === 'localhost') return 'http://localhost:3000';
  return import.meta.env.VITE_API_URL || 'https://agentpilot.onrender.com';
};
const API = getAPI();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch(`${API}/api/me`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Auth check failed:', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    const res = await fetch(`${API}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    setUser(data.user);
    return data;
  };

  const signup = async (formData) => {
    const res = await fetch(`${API}/api/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(formData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Signup failed');
    return data;
  };

  const logout = async () => {
    await fetch(`${API}/api/logout`, { method: 'POST', credentials: 'include' });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, checkAuth, API }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
