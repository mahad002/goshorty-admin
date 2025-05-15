import axios, { AxiosError, AxiosInstance } from 'axios';

// API base URL - should be set from environment variables in production
const API_URL = 'http://localhost:5001/api';

// Helper to setup axios instance with authentication header
const authAxios = (token: string): AxiosInstance => {
  return axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  });
};

// Store the token in localStorage
const setToken = (token: string): void => {
  localStorage.setItem('authToken', token);
};

// Get the token from localStorage
const getToken = (): string | null => {
  return localStorage.getItem('authToken');
};

// Remove the token from localStorage
const removeToken = (): void => {
  localStorage.removeItem('authToken');
};

// Check if user is authenticated
const isAuthenticated = (): boolean => {
  return !!getToken();
};

// Handle API errors consistently
const handleApiError = (error: any): string => {
  const message = 
    (error.response && error.response.data && error.response.data.message) ||
    error.message ||
    error.toString();
  
  // If token expired or invalid
  if (error.response && (error.response.status === 401 || error.response.status === 403)) {
    removeToken();
  }
  
  console.error('API Error:', error.response ? error.response.data : error);
  
  return message;
};

// Force using backend API
const ALWAYS_USE_BACKEND = true;

export {
  API_URL,
  authAxios,
  setToken,
  getToken,
  removeToken,
  isAuthenticated,
  handleApiError,
  ALWAYS_USE_BACKEND
}; 