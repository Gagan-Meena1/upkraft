import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface StudentCoursesState {
  courses: any[] | null;
}

const initialState: StudentCoursesState = {
  courses: null,
};

const studentCoursesSlice = createSlice({
  name: "studentCourses",
  initialState,
  reducers: {
    setStudentCourses: (
      state,
      action: PayloadAction<{ courseDetails: any[] }>
    ) => {
      state.courses = action.payload.courseDetails;
    },
  },
});

export const { setStudentCourses } = studentCoursesSlice.actions;
export default studentCoursesSlice.reducer;
