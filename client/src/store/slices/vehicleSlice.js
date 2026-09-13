import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { vehicleRepository } from '../../entities/vehicle/repository';

export const fetchVehicles = createAsyncThunk('vehicles/fetchAll', (userId) =>
  vehicleRepository.getAll(userId)
);

export const createVehicle = createAsyncThunk('vehicles/create', (data) =>
  vehicleRepository.create(data)
);

export const editVehicle = createAsyncThunk('vehicles/edit', ({ id, data }) =>
  vehicleRepository.update(id, data)
);

export const deleteVehicle = createAsyncThunk('vehicles/delete', (id) =>
  vehicleRepository.delete(id)
);

const vehicleSlice = createSlice({
  name: 'vehicle',
  initialState: {
    vehicles: [],
    selectedVehicleId: null,
    loading: false,
    error: null,
  },
  reducers: {
    setVehicles: (state, action) => { state.vehicles = action.payload; },
    addVehicle: (state, action) => { state.vehicles.push(action.payload); },
    updateVehicle: (state, action) => {
      const { id, changes } = action.payload;
      const idx = state.vehicles.findIndex((v) => v.id === id);
      if (idx !== -1) state.vehicles[idx] = { ...state.vehicles[idx], ...changes };
    },
    removeVehicle: (state, action) => {
      state.vehicles = state.vehicles.filter((v) => v.id !== action.payload);
    },
    selectVehicle: (state, action) => { state.selectedVehicleId = action.payload; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVehicles.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchVehicles.fulfilled, (state, action) => {
        state.loading = false;
        state.vehicles = action.payload;
        if (!state.selectedVehicleId && action.payload.length > 0) {
          state.selectedVehicleId = action.payload[0].id;
        }
      })
      .addCase(fetchVehicles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { setVehicles, addVehicle, updateVehicle, removeVehicle, selectVehicle } = vehicleSlice.actions;
export default vehicleSlice.reducer;
