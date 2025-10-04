// import axios from 'axios';

// const BASE = 'http://localhost:4950/api'; // Direct to backend

// const API = axios.create({
//   baseURL: BASE,
//   withCredentials: true,
// });

// API.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401 || error.response?.status === 403) {
//       if (error.response?.data?.requiresLogin) {
//         window.location.href = '/login';
//       }
//     }
//     return Promise.reject(error);
//   }
// );

// export default API;
// client/src/api/api.js
// client/src/api/api.js
// import axios from 'axios';

// const isDev = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;

// // In dev: use proxy (localhost:3001)
// // In prod: use /api (Vercel proxy)
// const BASE = isDev ? 'http://localhost:3001/api' : '/api';

// const API = axios.create({
//   baseURL: BASE,
//   withCredentials: true,
// });

// API.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401 || error.response?.status === 403) {
//       if (error.response?.data?.requiresLogin) {
//         window.location.href = '/login';
//       }
//     }
//     return Promise.reject(error);
//   }
// );

// export default API;
// client/src/api/api.js
// import axios from 'axios';

// const isDev = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;

// // In dev: use localhost:4950 directly
// // In prod: use /api (Vercel proxy)
// const BASE = isDev ? 'http://localhost:4950/api' : '/api';

// const API = axios.create({
//   baseURL: BASE,
//   withCredentials: true,
// });

// API.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401 || error.response?.status === 403) {
//       if (error.response?.data?.requiresLogin) {
//         window.location.href = '/login';
//       }
//     }
//     return Promise.reject(error);
//   }
// );

// export default API;
import axios from 'axios';

const isDev = process.env.NODE_ENV === 'development';

// In dev: direct to backend, in prod: use proxy
const BASE = isDev 
  ? 'http://localhost:4950/api' 
  : '/api';  // This uses the Vercel proxy

console.log('API Base URL:', BASE);

const API = axios.create({
  baseURL: BASE,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

API.interceptors.request.use(
  (config) => {
    console.log('Making request to:', config.baseURL + config.url);
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