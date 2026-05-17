import { createSlice } from "@reduxjs/toolkit";

type UserState = {
  email: string | null;
  token: string | null;
  id: string | null;
};

const defaultState: UserState = {
  email: null,
  token: null,
  id: null,
};

const getSavedUser = (): UserState => {
  const savedUser = localStorage.getItem("user");

  if (!savedUser) {
    return defaultState;
  }

  try {
    return JSON.parse(savedUser) as UserState;
  } catch {
    localStorage.removeItem("user");
    return defaultState;
  }
};

const userSlice = createSlice({
  name: "user",
  initialState: getSavedUser(),
  reducers: {
    setUser(state, action) {
      state.email = action.payload.email;
      state.token = action.payload.token;
      state.id = action.payload.id;
      localStorage.setItem("user", JSON.stringify(action.payload));
    },
    removeUser(state) {
      state.email = null;
      state.token = null;
      state.id = null;
      localStorage.removeItem("user");
    },
  },
});

export const { setUser, removeUser } = userSlice.actions;

export default userSlice.reducer;
