import { createSlice } from '@reduxjs/toolkit';

const settingsSlice = createSlice({
  name: 'settings',
  initialState: {
    currency: 'INR',
    distanceUnit: 'km',
    theme: 'dark',
    userId: null,
    userEmail: null,
  },
  reducers: {
    setUser: (state, action) => {
      state.userId = action.payload.userId;
      state.userEmail = action.payload.userEmail;
    },
    updateSettings: (state, action) => {
      return { ...state, ...action.payload };
    },
  },
});

export const { setUser, updateSettings } = settingsSlice.actions;
export default settingsSlice.reducer;
