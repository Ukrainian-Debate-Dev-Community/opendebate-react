import { create } from "zustand";

interface AuthUser {
  id: number;
  username: string;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  setAuth: (token: string, user: AuthUser) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem("jwt_token"),
  user: JSON.parse(localStorage.getItem("auth_user") || "null"),

  setAuth: (token, user) => {
    localStorage.setItem("jwt_token", token);
    localStorage.setItem("auth_user", JSON.stringify(user));
    set({ token, user });
  },

  logout: () => {
    localStorage.removeItem("jwt_token");
    localStorage.removeItem("auth_user");
    set({ token: null, user: null });
  },
}));
