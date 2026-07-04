import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

interface User {
  email: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = 'http://localhost:8080';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // Verify authentication with backend on mount
  useEffect(() => {
    const verifyAuth = async () => {
      const storedAuth = localStorage.getItem('isAuthenticated');
      const storedEmail = localStorage.getItem('userEmail');
      if (storedAuth === 'true' && storedEmail) {
        try {
          const response = await fetch(`${API_BASE}/api/auth/me`, {
            method: 'GET',
            credentials: 'include',
          });
          if (response.ok) {
            setIsAuthenticated(true);
            setUser({ email: storedEmail });
          } else {
            // Backend session is invalid or expired! Clean up local storage.
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('userEmail');
            setIsAuthenticated(false);
            setUser(null);
          }
        } catch (error) {
          console.error('Session verification failed:', error);
          // If server is unreachable, we can fallback to cached state,
          // or keep the login page depending on strictness. Let's keep it for offline.
          setIsAuthenticated(true);
          setUser({ email: storedEmail });
        }
      }
    };
    verifyAuth();
  }, []);

  const checkAuth = useCallback(() => {
    const storedAuth = localStorage.getItem('isAuthenticated');
    return storedAuth === 'true';
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include', // Important for cookies
    });

    if (!response.ok) {
      throw new Error('Login failed. Please check your credentials.');
    }

    // Store auth state
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userEmail', email);
    setIsAuthenticated(true);
    setUser({ email });
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    const response = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || 'Registration failed');
    }

    // Auto-login after registration
    await login(email, password);
  }, [login]);

  const logout = useCallback(async () => {
    try {
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    }

    // Clear auth state
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userEmail');
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      user,
      login,
      register,
      logout,
      checkAuth,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};