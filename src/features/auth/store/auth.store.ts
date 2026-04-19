import { create } from "zustand";
import { persist } from "zustand/middleware";
import { logout as logoutApi } from "../api/client";

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
  logout: () => Promise<void>;
  isAuthenticated: () => boolean;
  isTokenExpired: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      expiresAt: null,
      user: null,
      setAuth: (accessToken, expiresAt, user) => set({ accessToken, expiresAt, user }),
      clearAuth: () => set({ accessToken: null, expiresAt: null, user: null }),
      logout: async () => {
        await logoutApi();
        set({ accessToken: null, expiresAt: null, user: null });
      },
      isAuthenticated: () => {
        const { accessToken, expiresAt } = get();
        if (!accessToken || !expiresAt) return false;
        return new Date(expiresAt) > new Date();
      },
      isTokenExpired: () => {
        const { expiresAt } = get();
        if (!expiresAt) return true;
        return new Date(expiresAt) <= new Date();
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ user: state.user }),
    }
  )
);
