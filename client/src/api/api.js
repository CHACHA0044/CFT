import axios from 'axios';
import { fetchCsrfToken, getCsrfToken } from 'utils/csrf';
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
//Request interceptor with CSRF token
API.interceptors.request.use(
  async (config) => {
    // Adding CSRF token for state-changing requests
    if (['post', 'put', 'delete', 'patch'].includes(config.method?.toLowerCase())) {
      let token = getCsrfToken();
      
      // Fetch token if not available
      if (!token) {
        try {
          token = await fetchCsrfToken();
        } catch (error) {
          console.error('Failed to fetch CSRF token:', error);
          // Continue without token - let backend reject if needed
        }
      }
      
      if (token) {
        config.headers['X-CSRF-Token'] = token; // ✅ Add CSRF header
      }
    }
    
    if (isDev) {
      console.log('Making request to:', config.baseURL + config.url);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor with CSRF retry logic
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    // ignore cancelled requests (StrictMode)
    if (axios.isCancel(error) || error.code === "ERR_CANCELED") {
      return Promise.reject(error);
    }

    // Handling CSRF token errors
    if (error.response?.status === 403 && error.response?.data?.code === 'EBADCSRFTOKEN') {
      console.warn('⚠️ CSRF token invalid, refetching and retrying...');
      
      try {
        // Fetch new token
        const newToken = await fetchCsrfToken();
        
        // Retry the original request with new token
        const originalRequest = error.config;
        originalRequest.headers['X-CSRF-Token'] = newToken;
        originalRequest._retry = true; // Prevent infinite loops
        
        return API(originalRequest);
      } catch (csrfError) {
        console.error('Failed to retry with new CSRF token:', csrfError);
        return Promise.reject(error);
      }
    }

    console.error('API Error:', {
      status: error.response?.status,
      url: error.config?.url,
      method: error.config?.method,
      data: error.response?.data
    });

    if ([401, 403].includes(error.response?.status)) {
      if (error.response?.data?.requiresLogin) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default API;