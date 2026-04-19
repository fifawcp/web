import { create } from "zustand";

interface User {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  created_at: string;
  updated_at: string;
}

interface AuthState {
  accessToken: string | null;
  expiresAt: string | null;
  user: User | null;
  setAuth: (accessToken: string, expiresAt: string, user: User) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  expiresAt: null,
  user: null,
  setAuth: (accessToken, expiresAt, user) => set({ accessToken, expiresAt, user }),
  clearAuth: () => set({ accessToken: null, expiresAt: null, user: null }),
  isAuthenticated: () => {
    const { accessToken, expiresAt } = get();
    if (!accessToken || !expiresAt) return false;
    return new Date(expiresAt) > new Date();
  },
}));
