import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface UserState {
  id: string | null;
  name: string | null;
  email: string | null;
  token?: string | null; // optional
}

const initialState: UserState = {
  id: null,
  name: null,
  email: null,
  token: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUsers: (state, action: PayloadAction<UserState>) => {
      return { ...state, ...action.payload };
    },
    logout: () => initialState,
  },
});

export const { setUsers, logout } = userSlice.actions;
export default userSlice.reducer;
