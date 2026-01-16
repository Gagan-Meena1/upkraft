import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface StudentSate {
    student?: any | null;
}

const initialState: StudentSate = {
    student: null,
};

const studentSlice = createSlice({
    name: "student",
    initialState,
    reducers: {
        setStudent: (state, action: PayloadAction<StudentSate>) => {
            state.student = action?.payload?.filteredUsers
            // return { ...state, ...action.payload };
        },
    },
});

export const { setStudent } = studentSlice.actions;
export default studentSlice.reducer;
