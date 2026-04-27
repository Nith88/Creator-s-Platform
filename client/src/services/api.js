import axios from 'axios';
import { toast } from 'react-toastify';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add token to every request
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // If token exists, add to headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Return modified config
    return config;
  },
  (error) => {
    // Handle request error
    toast.error('Request failed. Please try again.');
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors and 401 responses
api.interceptors.response.use(
  (response) => {
    // If response is successful, just return it
    return response;
  },
  (error) => {
    // Handle error responses
    let errorMessage = 'An error occurred. Please try again.';

    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      // Extract error message from response
      errorMessage = data?.message || data?.error || errorMessage;

      // Handle specific status codes
      if (status === 400) {
        toast.error(`Validation Error: ${errorMessage}`);
      } else if (status === 401) {
        // Token is invalid or expired
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        toast.error('Session expired. Please login again.');
        
        // Redirect to login page
        window.location.href = '/login';
      } else if (status === 403) {
        toast.error('You do not have permission to perform this action.');
      } else if (status === 404) {
        toast.error(`Not Found: ${errorMessage}`);
      } else if (status === 500) {
        toast.error('Server error. Please try again later.');
      } else {
        toast.error(errorMessage);
      }
    } else if (error.request) {
      // Request made but no response received
      errorMessage = 'No response from server. Please check your connection.';
      toast.error(errorMessage);
    } else {
      // Error in request setup
      errorMessage = error.message || 'Request setup error';
      toast.error(errorMessage);
    }

    // Log error details for debugging
    console.error('API Error:', {
      message: errorMessage,
      status: error.response?.status,
      data: error.response?.data,
      request: error.request ? 'No response received' : 'No request made',
      error: error.message,
    });

    // Return the error for component to handle if needed
    return Promise.reject(error);
  }
);

export default api;
