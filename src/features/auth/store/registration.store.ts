import { create } from "zustand";

interface RegistrationData {
  username: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface RegistrationStore {
  registrationData: RegistrationData | null;
  setRegistrationData: (data: RegistrationData) => void;
  clearRegistrationData: () => void;
}

export const useRegistrationStore = create<RegistrationStore>((set) => ({
  registrationData: null,
  setRegistrationData: (data) => set({ registrationData: data }),
  clearRegistrationData: () => set({ registrationData: null }),
}));
