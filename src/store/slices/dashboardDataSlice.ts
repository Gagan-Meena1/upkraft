import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const fetchDashboardData = createAsyncThunk(
    "dashboard/fetch",
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetch("/Api/DashboardData", { cache: "no-store" });
            const data = await response.json();
            return data;
        } catch (err) {
            return rejectWithValue(err);
        }
    }
);

const initialState = {
    userData: null,
    courseDetails: [],
    classDetails: [],
    studentCount: 0,
    loading: false,
};

const userDashboardSlice = createSlice({
    name: "dashboard",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchDashboardData.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchDashboardData.fulfilled, (state, action) => {
                state.loading = false;
                state.userData = action.payload?.user ?? null;
                state.courseDetails = action.payload?.courseDetails ?? [];
                state.studentCount = action.payload?.studentCount ?? 0;
                state.classDetails = action.payload?.classDetails ?? [];
            })
            .addCase(fetchDashboardData.rejected, (state) => {
                state.loading = false;
            });
    },
});

export default userDashboardSlice.reducer;
