import axios from 'axios';

const isDev = process.env.NODE_ENV === 'development';

// In prod: direct to backend, in dev: use proxy, no longer proxy is needed in prod
const BASE = isDev 
  ? 'http://localhost:4950/api' 
  : 'https://api.carbonft.app/api';  

//console.log('API Base URL:', BASE);

const API = axios.create({
  baseURL: BASE,
  withCredentials: true,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

API.interceptors.request.use(
  (config) => {
    if (isDev) {
    console.log('Making request to:', config.baseURL + config.url);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

API.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', {
      status: error.response?.status,
      url: error.config?.url,
      method: error.config?.method,
      data: error.response?.data
    });
    
    if (error.response?.status === 401 || error.response?.status === 403) {
      if (error.response?.data?.requiresLogin) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default API;