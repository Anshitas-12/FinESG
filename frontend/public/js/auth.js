// Authentication module - Connected to Backend API
const API_BASE = 'http://localhost:8080';

class AuthManager {
  constructor() {
    this.isAuthenticated = localStorage.getItem('authenticated') === 'true';
  }

  async login(email, password) {
    if (!email || !password) {
      return { success: false, error: 'Please fill in all fields' };
    }

    if (password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters' };
    }

    try {
      const response = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important for cookies
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        this.isAuthenticated = true;
        localStorage.setItem('authenticated', 'true');
        localStorage.setItem('userEmail', email);
        return { success: true };
      } else {
        const error = await response.json();
        return { success: false, error: error.detail || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Connection error. Is the server running?' };
    }
  }

  async signup(email, password, confirmPassword) {
    if (!email || !password || !confirmPassword) {
      return { success: false, error: 'Please fill in all fields' };
    }

    if (password !== confirmPassword) {
      return { success: false, error: 'Passwords do not match' };
    }

    if (password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters' };
    }

    try {
      // First register
      const registerResponse = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!registerResponse.ok) {
        const error = await registerResponse.json();
        return { success: false, error: error.detail || 'Registration failed' };
      }

      // Then login to get cookie
      return await this.login(email, password);
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: 'Connection error. Is the server running?' };
    }
  }

  async logout() {
    try {
      await fetch(`${API_BASE}/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    this.isAuthenticated = false;
    localStorage.setItem('authenticated', 'false');
    localStorage.removeItem('userEmail');
  }

  isLoggedIn() {
    return this.isAuthenticated;
  }
}

const authManager = new AuthManager();
