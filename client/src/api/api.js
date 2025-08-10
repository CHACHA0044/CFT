import axios from 'axios';

const BASE = 'https://cft-be.onrender.com' || 'http://localhost:5000/api';
const API = axios.create({
  baseURL: BASE,
  withCredentials: true,
});
export default API;

