/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';

// Define the base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Important for cookies
});

// Add request interceptor to include token in authorized requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Mock data for users (keeping for fallback)
export const users = [
  { id: 1, name: 'Budi Santoso', email: 'budi@example.com', role: 'Admin', avatar: 'https://i.pravatar.cc/150?img=1' },
  { id: 2, name: 'Siti Nuraini', email: 'siti@example.com', role: 'Editor', avatar: 'https://i.pravatar.cc/150?img=2' },
  { id: 3, name: 'Agus Wijaya', email: 'agus@example.com', role: 'User', avatar: 'https://i.pravatar.cc/150?img=3' },
  { id: 4, name: 'Dewi Lestari', email: 'dewi@example.com', role: 'User', avatar: 'https://i.pravatar.cc/150?img=4' },
  { id: 5, name: 'Eko Prasetyo', email: 'eko@example.com', role: 'Editor', avatar: 'https://i.pravatar.cc/150?img=5' },
  { id: 6, name: 'Rina Wati', email: 'rina@example.com', role: 'User', avatar: 'https://i.pravatar.cc/150?img=6' },
  { id: 7, name: 'Hadi Sutrisno', email: 'hadi@example.com', role: 'User', avatar: 'https://i.pravatar.cc/150?img=7' },
  { id: 8, name: 'Maya Sari', email: 'maya@example.com', role: 'Editor', avatar: 'https://i.pravatar.cc/150?img=8' }
];

// Sample cities for weather data (keeping for fallback)
const cities = [
  { id: 1, name: 'Jakarta', coordinates: { lat: -6.21, lon: 106.85 } },
  { id: 2, name: 'Surabaya', coordinates: { lat: -7.25, lon: 112.75 } },
  { id: 3, name: 'Bandung', coordinates: { lat: -6.92, lon: 107.62 } },
  { id: 4, name: 'Medan', coordinates: { lat: 3.59, lon: 98.67 } },
  { id: 5, name: 'Semarang', coordinates: { lat: -6.97, lon: 110.42 } },
  { id: 6, name: 'Makassar', coordinates: { lat: -5.15, lon: 119.43 } }
];

// Mock weather data generator (keeping for fallback)
const generateWeatherData = (city: any) => {
  const weatherConditions = ['Cerah', 'Berawan', 'Hujan Ringan', 'Hujan Deras', 'Berawan Sebagian'];
  const randomCondition = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
  const randomTemp = Math.floor(Math.random() * 10) + 25; // 25-35°C
  const randomHumidity = Math.floor(Math.random() * 30) + 60; // 60-90%
  const randomWind = Math.floor(Math.random() * 20) + 5; // 5-25 km/h

  return {
    city: city.name,
    coordinates: city.coordinates,
    condition: randomCondition,
    temperature: randomTemp,
    humidity: randomHumidity,
    wind: randomWind,
    forecast: Array(5).fill(null).map((_, i) => ({
      day: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000).toLocaleDateString('id-ID', { weekday: 'long' }),
      condition: weatherConditions[Math.floor(Math.random() * weatherConditions.length)],
      tempHigh: randomTemp + Math.floor(Math.random() * 3),
      tempLow: randomTemp - Math.floor(Math.random() * 5)
    }))
  };
};

// Mock API delay (for testing loading states)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// API calls
export const api = {
  // Get current user with improved error handling
  getCurrentUser: async () => {
    try {
      const response = await axiosInstance.get('/api/user');
      return response.data.user;
    } catch (error) {
      console.error('Error fetching current user:', error);
      throw error;
    }
  },
  
  // Login user with Laravel Sanctum using axios
  loginUser: async (email: string, password: string) => {
    try {
      // First, get the CSRF cookie
      await axiosInstance.get('/sanctum/csrf-cookie');
      
      // Attempt login
      const response = await axiosInstance.post('/api/login', { 
        email, 
        password 
      });
      
      // Store the token from the Laravel response
      if (response.data.access_token) {
        localStorage.setItem('auth_token', response.data.access_token);
        
        // Immediately fetch user data to ensure it's available
        try {
          const userData = await api.getCurrentUser();
          response.data.user = userData; // Update the user data in the response
        } catch (userDataError) {
          console.error('Error fetching user data after login:', userDataError);
          // Continue even if this fails, the main login was successful
        }
      }
      
      return response.data;
    } catch (error) {
      console.error('Login API error:', error);
      throw error;
    }
  },
  
  // Register user with Laravel Sanctum using axios
  registerUser: async (email: string, password: string, name: string) => {
    try {
      // First, get the CSRF cookie
      await axiosInstance.get('/sanctum/csrf-cookie');
      
      // Attempt registration
      const response = await axiosInstance.post('/api/register', { 
        email, 
        password, 
        name,
        password_confirmation: password // Laravel usually expects this
      });
      
      // Instead of calling loginUser, directly handle the authentication here
      if (response.data.access_token) {
        localStorage.setItem('auth_token', response.data.access_token);
        
        // Immediately fetch user data to ensure it's available
        try {
          const userData = await api.getCurrentUser();
          response.data.user = userData; // Update the user data in the response
        } catch (userDataError) {
          console.error('Error fetching user data after registration:', userDataError);
        }
      }
      
      return response.data;
    } catch (error) {
      console.error('Registration API error:', error);
      throw error;
    }
  },
  
  // Logout user (Laravel Sanctum) using axios
  logoutUser: async () => {
    try {
      await axiosInstance.post('/api/logout');
      
      // Remove token from localStorage after successful server logout
      localStorage.removeItem('auth_token');
      
      // Reload the page after successful logout
      window.location.reload();
      return true;
    } catch (error) {
      console.error('Logout API error:', error);
      return false;
    }
  },
  
  // Check if token is valid and get user data
  verifyToken: async () => {
    try {
      const response = await axiosInstance.get('/api/user');
      return { isValid: true, userData: response.data };
    } catch (error) {
      console.error('Token verification error:', error);
      return { isValid: false, userData: null };
    }
  },
  
  // Get all users (Admin only)
  getUsers: async () => {
    try {
      const response = await axiosInstance.get('/api/users');
      // Assuming the backend returns { is_success: true, users: [...] }
      if (response.data && response.data.is_success && Array.isArray(response.data.users)) {
        return response.data.users; 
      } else if (Array.isArray(response.data)) {
         // Fallback if it just returns the array
         return response.data;
      }
      throw new Error('Format data pengguna tidak dikenal.');
    } catch (error: any) {
      console.error('Get users error:', error);
      const message = error.response?.data?.message || error.message || 'Gagal mengambil data pengguna.';
      throw new Error(message);
    }
  },
  
  // Create a new user (Admin only)
  createUser: async (userData: { name: string; email: string; password?: string; role?: string }) => {
    try {
      // Add password_confirmation if password is provided
      const payload = userData.password 
        ? { ...userData, password_confirmation: userData.password } 
        : userData;
        
      const response = await axiosInstance.post('/api/users', payload);
      
      if (!response.data.is_success) {
        throw new Error(response.data.message || 'Gagal membuat pengguna.');
      }
      return response.data; // Should contain { is_success: true, user: {...}, message: '...' }
    } catch (error: any) {
      console.error('Create user error:', error);
      const message = error.response?.data?.message || error.message || 'Gagal membuat pengguna.';
      throw new Error(message);
    }
  },

  // Get user by ID (Admin or self)
  getUserById: async (userId: number) => {
    try {
      const response = await axiosInstance.get(`/api/users/${userId}`);
      // Assuming backend returns { is_success: true, user: {...} }
      if (response.data && response.data.is_success && response.data.user) {
        return response.data.user;
      }
      throw new Error('Format data pengguna tidak dikenal.');
    } catch (error: any) {
      // Handle 403 Forbidden responses specifically from the Laravel middleware
      if (error.response && error.response.status === 403) {
        throw new Error('Anda tidak memiliki izin untuk melihat profil ini');
      }
      console.error('Get user by ID error:', error);
      const message = error.response?.data?.message || error.message || 'Gagal mengambil data pengguna.';
      throw new Error(message);
    }
  },

  // Update user profile (Admin or self, handled by 'user.ownership' middleware)
  updateUserProfile: async (userId: number, userData: any) => {
    try {
      // Remove id from payload if present, as it's in the URL
      const {...payload } = userData; 
      
      // Add password_confirmation if password is being updated
      if (payload.password) {
        payload.password_confirmation = payload.password;
      }

      const response = await axiosInstance.put(`/api/users/${userId}`, payload);
      
      if (!response.data.is_success) {
        throw new Error(response.data.message || 'Gagal memperbarui profil');
      }
      
      return response.data; // Should contain { is_success: true, user: {...}, message: '...' }
    } catch (error: any) {
      // Handle 403 Forbidden responses specifically from the Laravel middleware
      if (error.response && error.response.status === 403) {
        throw new Error('Anda tidak memiliki izin untuk mengubah profil ini');
      }
      console.error('Update profile error:', error);
      const message = error.response?.data?.message || error.message || 'Gagal memperbarui profil.';
      throw new Error(message);
    }
  },

  // Delete user account (self, handled by 'user.ownership' middleware)
  deleteSelfAccount: async (userId: number) => {
    try {
      // This endpoint is DELETE /users/{id} but requires ownership middleware pass
      const response = await axiosInstance.delete(`/api/users/${userId}`);
      
      if (response.data && response.data.is_success !== undefined) {
         return response.data; 
      } else {
         console.warn('Unexpected response structure from deleteSelfAccount:', response.data);
         throw new Error('Respons tidak dikenal dari server saat menghapus akun.');
      }

    } catch (error: any) {
      console.error('Delete self account API error:', error);
      const message = error.response?.data?.message || error.message || 'Gagal menghapus akun.';
      throw new Error(message); 
    }
  },

  // Delete user by Admin (Admin only)
  deleteUserByAdmin: async (userId: number) => {
    try {
      // This endpoint is DELETE /users/{id} and requires admin middleware pass
      const response = await axiosInstance.delete(`/api/users/${userId}`);
      
      if (response.data && response.data.is_success !== undefined) {
         return response.data; // Return { is_success: true, message: '...' }
      } else {
         console.warn('Unexpected response structure from deleteUserByAdmin:', response.data);
         throw new Error('Respons tidak dikenal dari server saat menghapus pengguna.');
      }

    } catch (error: any) {
      console.error('Delete user by admin API error:', error);
      const message = error.response?.data?.message || error.message || 'Gagal menghapus pengguna.';
      throw new Error(message); 
    }
  },
  
  // Get weather data for a specific city
  getWeatherForCity: async (cityName: string) => {
    try {
      const response = await axiosInstance.get(`/api/weather/${encodeURIComponent(cityName)}`);
      
      if (!response.data.is_success) {
        throw new Error(response.data.message || 'Failed to get weather data');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Weather API error:', error);
      throw error;
    }
  },

  // Get available cities for weather (can keep this for preset cities)
  getWeatherCities: async () => {
    // Keep the predefined cities for quick selection
    return [...cities];
  },
  
  // Get weather for current location
  getWeatherForCurrentLocation: async () => {
    // Using axios with delay for testing loading states
    await delay(1500);
    // Just return Jakarta weather as default
    return generateWeatherData(cities[0]);
  },

  // Get user additional info
  getUserInfo: async (userId: number) => {
    try {
      const response = await axiosInstance.get(`/api/users/${userId}/info`);
      if (response.data && response.data.is_success) {
        return response.data.data; // Assuming backend returns { is_success: true, data: {...} }
      }
      return null;
    } catch (error: any) {
      console.error('Get user info error:', error);
      const message = error.response?.data?.message || error.message || 'Gagal mengambil informasi tambahan pengguna.';
      throw new Error(message);
    }
  },

  // Save user additional info (handles both create and update)
  saveUserInfo: async (userId: number, infoData: FormData) => {
    try {
      const response = await axiosInstance.post(`/api/users/${userId}/info`, infoData, {
        headers: {
          'Content-Type': 'multipart/form-data', // Important for file uploads
        },
      });
      
      if (!response.data.is_success) {
        throw new Error(response.data.message || 'Gagal menyimpan informasi tambahan');
      }
      
      return response.data; // Should contain { is_success: true, data: {...}, message: '...' }
    } catch (error: any) {
      console.error('Save user info error:', error);
      const message = error.response?.data?.message || error.message || 'Gagal menyimpan informasi tambahan.';
      throw new Error(message);
    }
  },

  // Delete user account (Admin or self)
  deleteUserAccount: async (userId: number) => {
    try {
      // This endpoint is DELETE /users/{id} but requires ownership middleware pass
      const response = await axiosInstance.delete(`/api/users/${userId}`);
      
      if (response.data && response.data.is_success !== undefined) {
         return response.data; 
      } else {
         console.warn('Unexpected response structure from deleteUserAccount:', response.data);
         throw new Error('Respons tidak dikenal dari server saat menghapus akun.');
      }

    } catch (error: any) {
      console.error('Delete account API error:', error);
      const message = error.response?.data?.message || error.message || 'Gagal menghapus akun.';
      throw new Error(message); 
    }
  },
};
