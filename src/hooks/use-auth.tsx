import { create } from 'zustand';

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
  user: null,
  login: async (email: string, password: string) => {
    try {
      const response = await fetch('http://localhost:5001/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      if (response.ok) {
        const user: User = await response.json();
        set({ user });
        return user;
      }
      return null;
    } catch (error) {
      console.error('Login error:', error);
      return null;
    }
  },
  logout: () => set({ user: null }),
}));
