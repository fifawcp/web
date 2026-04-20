import { create } from "zustand";
import { OtpPurpose } from "../types/auth.types";

interface RegistrationData {
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  purpose: OtpPurpose;
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
