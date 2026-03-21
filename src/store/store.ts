import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import userReducer from "../store/slices/userSlice";
import dashboardReducer from "../store/slices/dashboardDataSlice";
import studentReducer from "../store/slices/studentDataSlice";
import studentCoursesReducer from "../store/slices/studentCoursesSlice";

const rootReducer = combineReducers({
  user: userReducer,
  dashboard: dashboardReducer,
  student: studentReducer,
  studentCourses: studentCoursesReducer,
});

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["user"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
