import { configureStore } from '@reduxjs/toolkit';
import vehicleReducer from './slices/vehicleSlice';
import settingsReducer from './slices/settingsSlice';
import chatReducer from './slices/chatSlice';

export const store = configureStore({
  reducer: {
    vehicle: vehicleReducer,
    settings: settingsReducer,
    chat: chatReducer,
  },
});
