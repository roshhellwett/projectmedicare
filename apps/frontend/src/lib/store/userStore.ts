import { create } from "zustand";
import { persist } from "zustand/middleware";

type UserState = {
  name: string;
  phone: string;
  address: string;
  setUserInfo: (info: Partial<{ name: string; phone: string; address: string }>) => void;
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      name: "",
      phone: "",
      address: "",
      setUserInfo: (info) => set((state) => ({ ...state, ...info })),
    }),
    {
      name: "jm-user-storage",
    }
  )
);
