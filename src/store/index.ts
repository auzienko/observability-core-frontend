import { configureStore } from '@reduxjs/toolkit';
import servicesReducer from './slices/servicesSlice';

export const store = configureStore({
  reducer: {
    services: servicesReducer,
    // другие slices здесь
  },
  // Middleware для логирования в dev режиме
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;