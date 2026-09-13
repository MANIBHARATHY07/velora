import { createSlice } from '@reduxjs/toolkit';

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    messages: [],
    isStreaming: false,
    selectedVehicleId: null,
  },
  reducers: {
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    setStreaming: (state, action) => {
      state.isStreaming = action.payload;
    },
    updateLastMessage: (state, action) => {
      if (state.messages.length > 0) {
        const last = state.messages[state.messages.length - 1];
        last.content = action.payload;
      }
    },
    clearHistory: (state) => {
      state.messages = [];
      state.isStreaming = false;
    },
    setVehicle: (state, action) => {
      state.selectedVehicleId = action.payload;
    },
  },
});

export const { addMessage, setStreaming, updateLastMessage, clearHistory, setVehicle } = chatSlice.actions;
export default chatSlice.reducer;
