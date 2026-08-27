import { create } from 'zustand';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'parent' | 'teacher' | 'admin';
}

interface AuthState {
  user: User | null;
  login: (email: string, password: string) => Promise<User | null>;
  logout: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: (() => {
    try {
      const storedUser = localStorage.getItem('portal-user');
      return storedUser ? JSON.parse(storedUser) as User : null;
    } catch {
      return null;
    }
  })(),
  login: async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      if (response.ok) {
        const user: User = await response.json();
        localStorage.setItem('portal-user', JSON.stringify(user));
        set({ user });
        return user;
      }
      return null;
    } catch (error) {
      console.error('Login error:', error);
      return null;
    }
  },
  logout: () => {
    localStorage.removeItem('portal-user');
    set({ user: null });
  },
}));
