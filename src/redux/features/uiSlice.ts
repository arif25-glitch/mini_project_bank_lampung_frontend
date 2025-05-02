import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface WeatherState {
  condition: string | null;
  isActive: boolean;
}

interface UiState {
  weather: WeatherState;
}

const initialState: UiState = {
  weather: {
    condition: null,
    isActive: false
  }
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setWeatherActive: (state, action: PayloadAction<boolean>) => {
      state.weather.isActive = action.payload;
      // Reset condition when leaving the weather page
      if (!action.payload) {
        state.weather.condition = null;
      }
    },
    setWeatherCondition: (state, action: PayloadAction<string | null>) => {
      state.weather.condition = action.payload;
    },
    resetWeatherUI: (state) => {
      state.weather.isActive = false;
      state.weather.condition = null;
    }
  }
});

export const { setWeatherActive, setWeatherCondition, resetWeatherUI } = uiSlice.actions;

export default uiSlice.reducer;
