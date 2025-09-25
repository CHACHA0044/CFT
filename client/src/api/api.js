// client/src/api/api.js
import axios from 'axios';

const BASE = process.env.REACT_APP_API_URL || 'http://localhost:4950/api';

const API = axios.create({
  baseURL: BASE,
  withCredentials: true, // cookies
});
API.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
// client/src/api/api.js
// import axios from 'axios';

// const BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// console.log("🔍 Using API Base URL:", BASE);

// const API = axios.create({
//   baseURL: BASE,
//   withCredentials: true,
// });

// API.interceptors.request.use((config) => {
//   const token = sessionStorage.getItem('authToken');
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// export default API;

