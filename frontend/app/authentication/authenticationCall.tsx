import axios from "axios";
import { API_URL } from '@env';
import * as SecureStore from 'expo-secure-store';

// Create an axios instance
export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000, // Optional: Set a timeout for requests
});

// Add a request interceptor to include the token in the headers
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync('token');
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
        SecureStore.deleteItemAsync('token');
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
