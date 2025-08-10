import axios from 'axios';

// const BASE =  || 'http://localhost:5000/api';
// src/api/api.js
const BASE =
  process.env.NODE_ENV === 'production'
    ? '/api'
    : 'http://localhost:5000/api';


const API = axios.create({
  baseURL: BASE,
  withCredentials: true,
});
export default API;

