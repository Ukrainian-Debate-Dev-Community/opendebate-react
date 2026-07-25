import { create } from "zustand";
import { jwtDecode } from "jwt-decode";
import type { AuthUser } from "../types/api";

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  setAuth: (token: string, user: Omit<AuthUser, "isAdmin">) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem("token"),
  user: localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user") as string)
    : null,

  setAuth: (token, userData) => {
    let isAdmin = false;

    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        isAdmin = !!decoded.isAdmin;
      } catch (error) {
        console.error("Failed to decode token", error);
      }
    }

    const fullUser = { ...userData, isAdmin };

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(fullUser));

    set({ token, user: fullUser });
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({ token: null, user: null });
  },
}));
