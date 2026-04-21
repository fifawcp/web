import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { logout as logoutApi } from "../api/client";
import { User } from "@/shared/types/interfaces";
import { logger } from "@/shared/lib/logger";

interface AuthState {
  accessToken: string | null;
  expiresAt: string | null;
  user: User | null;
  _hasHydrated: boolean;
  isInitializing: boolean;
  setAuth: (accessToken: string, expiresAt: string, user: User) => void;
  clearAuth: () => void;
  logout: () => Promise<void>;
  isAuthenticated: () => boolean;
  isTokenExpired: () => boolean;
  setHasHydrated: (hasHydrated: boolean) => void;
  setIsInitializing: (isInitializing: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      expiresAt: null,
      user: null,
      _hasHydrated: false,
      isInitializing: true,
      setAuth: (accessToken, expiresAt, user) => {
        logger.info("[AuthStore] Setting auth, user:", user);
        set({ accessToken, expiresAt, user });
      },
      clearAuth: () => {
        logger.info("[AuthStore] Clearing auth");
        set({ accessToken: null, expiresAt: null, user: null });
      },
      setHasHydrated: (hasHydrated) => {
        set({ _hasHydrated: hasHydrated });
      },
      setIsInitializing: (isInitializing) => {
        set({ isInitializing });
      },
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
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => {
        logger.info("[AuthStore] Persisting user:", state.user);
        return { user: state.user };
      },
      onRehydrateStorage: () => (state) => {
        logger.info("[AuthStore] Rehydration complete, user from storage:", state?.user);
        state?.setHasHydrated(true);
      },
    }
  )
);
