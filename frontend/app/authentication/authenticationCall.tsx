import axios from "axios";
import { API_URL } from '@env';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Platform-specific token storage utilities
export const tokenStorage = {
  getToken: async (key: string): Promise<string | null> => {
    try {
      if (Platform.OS === 'web') {
        // Use localStorage for web
        return localStorage.getItem(key);
      } else {
        // Use SecureStore for native platforms
        return await SecureStore.getItemAsync(key);
      }
    } catch (error) {
      console.error('Error retrieving token:', error);
      return null;
    }
  },
  
  setToken: async (key: string, value: string): Promise<boolean> => {
    try {
      if (Platform.OS === 'web') {
        // Use localStorage for web
        localStorage.setItem(key, value);
        return true;
      } else {
        // Use SecureStore for native platforms
        await SecureStore.setItemAsync(key, value);
        return true;
      }
    } catch (error) {
      console.error('Error storing token:', error);
      return false;
    }
  },
  
  removeToken: async (key: string): Promise<boolean> => {
    try {
      if (Platform.OS === 'web') {
        // Use localStorage for web
        localStorage.removeItem(key);
        return true;
      } else {
        // Use SecureStore for native platforms
        await SecureStore.deleteItemAsync(key);
        return true;
      }
    } catch (error) {
      console.error('Error removing token:', error);
      return false;
    }
  }
};

// Create an axios instance
export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000, // Optional: Set a timeout for requests
});

// Add a request interceptor to include the token in the headers
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await tokenStorage.getToken('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Error retrieving token:", error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => response, // Pass through successful responses
  (error) => {
    // Handle common errors (e.g., unauthorized, network issues)
    if (error.response) {
      // Server returned an error response
      if (error.response.status === 401) {
        console.error("Unauthorized. Please check your token.");
        // Optionally clear the token and navigate to login
        tokenStorage.removeToken('token');
      } else if (error.response.status === 500) {
        console.error("Server error. Please try again later.");
      }
    } else if (error.request) {
      // No response received (network issues)
      console.error("No response from server. Please check your connection.");
    } else {
      // Something else caused the error
      console.error("Error:", error.message);
    }
    return Promise.reject(error);
  }
);
