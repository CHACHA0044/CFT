import axios from 'axios';

// ✅ Replace localhost with your live Render backend URL
const API = axios.create({
  baseURL: 'http://localhost:5000/api', // ✅ Important https://carbon-backend-ra0j.onrender.com/api
});
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;
