import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface UserState {
  id?: string | null;
  name?: string | null;
  email?: string | null;
  token?: string | null; // optional
  userData?: Record<string, any>;
  courseData?: Record<string, any>;
}

const initialState: UserState = {
  id: null,
  name: null,
  email: null,
  token: null,
  userData: {},
  courseData: []
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUsers: (state, action: PayloadAction<UserState>) => {
      return { ...state, ...action.payload };
    },
    setCoursesData: (
      state,
      action: PayloadAction<{ courseData: any }>
    ) => {
      state.courseData = action.payload;
    },
    logout: () => initialState,
  },
});

export const { setUsers, logout, setCoursesData } = userSlice.actions;
export default userSlice.reducer;
