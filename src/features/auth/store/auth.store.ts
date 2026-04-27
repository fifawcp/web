import { create } from "zustand";
import { persist, createJSONStorage, type StateStorage } from "zustand/middleware";
import { OtpPurpose } from "../types/auth.types";

/** Avoids `createJSONStorage(() => sessionStorage)` failing during SSR (no `sessionStorage`), which would drop `persist` from the store API entirely. */
const sessionStorageOrNoop: StateStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

function getSessionStorage(): StateStorage {
  if (typeof window === "undefined") return sessionStorageOrNoop;
  return window.sessionStorage;
}

interface AuthStoreState {
  identifier: string;
  purpose: OtpPurpose;
  otp: string;
  username: string;
  firstName: string;
  lastName: string;
  setIdentifier: ({ identifier, purpose }: { identifier: string; purpose: OtpPurpose }) => void;
  setOtp: (otp: string) => void;
  setProfile: (profile: { username: string; firstName: string; lastName: string }) => void;
  reset: () => void;
}

const initialState = {
  identifier: "",
  purpose: "login" as OtpPurpose,
  otp: "",
  username: "",
  firstName: "",
  lastName: "",
};

export const useAuthStore = create<AuthStoreState>()(
  persist(
    (set) => ({
      ...initialState,
      setIdentifier: ({ identifier, purpose }) => set({ identifier, purpose }),
      setOtp: (otp) => set({ otp }),
      setProfile: ({ username, firstName, lastName }) => set({ username, firstName, lastName }),
      reset: () => set(initialState),
    }),
    {
      name: "wcp-auth-flow", // storage key
      // TODO: consider adding cosmetic encryption to the storage
      storage: createJSONStorage(getSessionStorage),
      partialize: (state) => ({
        identifier: state.identifier,
        purpose: state.purpose,
      }),
    },
  ),
);