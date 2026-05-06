import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);
const API = import.meta.env.VITE_API_URL || 'https://agentpilot.onrender.com';

// ──── Token helpers ────
const getToken = () => localStorage.getItem('ap_token');
const setToken = (t) => localStorage.setItem('ap_token', t);
const removeToken = () => localStorage.removeItem('ap_token');

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if redirected back from Google OAuth (?token=...)
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
      // Clean token from URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = getToken();
    if (!token) { setLoading(false); return; }
    try {
      const res = await fetch(`${API}/api/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        removeToken();
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
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || data.error || 'Login failed');
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const signup = async (formData) => {
    const res = await fetch(`${API}/api/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || data.error || 'Signup failed');
    return data;
  };

  const logout = async () => {
    removeToken();
    setUser(null);
  };

  // Pass token getter so Dashboard can use it for /api/agent calls
  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, checkAuth, API, getToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
