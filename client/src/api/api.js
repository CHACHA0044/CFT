// client/src/api/api.js
import axios from 'axios';

const BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const API = axios.create({
  baseURL: BASE,
  withCredentials: true, // cookies
});

export default API;
