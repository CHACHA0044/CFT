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
import axios from 'axios';

const isDev = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;

// In dev: use proxy (localhost:3001)
// In prod: use /api (Vercel proxy)
const BASE = isDev ? 'http://localhost:3001/api' : '/api';

const API = axios.create({
  baseURL: BASE,
  withCredentials: true,
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      if (error.response?.data?.requiresLogin) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default API;