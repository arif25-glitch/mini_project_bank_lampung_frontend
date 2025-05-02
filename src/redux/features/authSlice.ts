import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../services/api';

// Check for existing authentication in localStorage by token
const hasToken = localStorage.getItem('auth_token') !== null;
const initialIsAuthenticated = hasToken;

// Define user data interface
interface UserData {
  id?: number;
  name: string;
  email: string;
  role?: string;
  avatar?: string;
  // Add other fields that might come from your Laravel API
}

interface AuthState {
  isAuthenticated: boolean;
  isLogin: boolean;
  formData: {
    email: string;
    password: string;
    confirmPassword: string;
    name: string;
  };
  formSubmitted: boolean;
  userData: UserData | null; // New field for storing user data from the server
  loading: boolean; // Add loading state
  error: string | null; // Add error state
}

const initialState: AuthState = {
  isAuthenticated: initialIsAuthenticated,
  isLogin: true,
  formData: {
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
  },
  formSubmitted: false,
  userData: null, // Initialize with no user data
  loading: false,
  error: null,
};

// Async thunk to fetch user data
export const fetchUserData = createAsyncThunk(
  'auth/fetchUserData',
  async (_, { rejectWithValue }) => {
    try {
      const userData = await api.getCurrentUser();
      return userData;
    } catch (error) {
      return rejectWithValue('Failed to fetch user data');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setIsLogin: (state, action: PayloadAction<boolean>) => {
      state.isLogin = action.payload;
      // Reset form data when switching modes
      state.formData = {
        email: '',
        password: '',
        confirmPassword: '',
        name: '',
      };
    },
    updateFormData: (state, action: PayloadAction<{ name: string; value: string }>) => {
      const { name, value } = action.payload;
      state.formData = {
        ...state.formData,
        [name]: value,
      };
    },
    setFormSubmitted: (state, action: PayloadAction<boolean>) => {
      state.formSubmitted = action.payload;
    },
    // Modify loginSuccess to accept user data
    loginSuccess: (state, action: PayloadAction<UserData | undefined>) => {
      state.isAuthenticated = true;
      
      // If user data is provided, update state
      if (action.payload) {
        state.userData = action.payload;
      }
      
      state.formSubmitted = false;
    },
    // Update logout to clear user data
    logout: (state) => {
      state.isAuthenticated = false;
      state.userData = null;
    },
    // Add setUserData action for when user data is loaded separately
    setUserData: (state, action: PayloadAction<UserData>) => {
      state.userData = action.payload;
    },
    clearForm: (state) => {
      state.formData = {
        email: '',
        password: '',
        confirmPassword: '',
        name: '',
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserData.fulfilled, (state, action) => {
        state.loading = false;
        state.userData = action.payload;
      })
      .addCase(fetchUserData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  setIsLogin, 
  updateFormData, 
  setFormSubmitted, 
  loginSuccess, 
  logout,
  clearForm,
  setUserData
} = authSlice.actions;

export default authSlice.reducer;
