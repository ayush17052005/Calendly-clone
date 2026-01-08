import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
console.log('API Base URL:', baseURL);

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a response interceptor for global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Return the error object to be handled by the caller
    const message = error.response?.data?.message || 'Something went wrong';
    console.error(`API Error: ${message}`);
    return Promise.reject({ ...error, message });
  }
);

export default api;
