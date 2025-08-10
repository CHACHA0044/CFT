import axios from 'axios';

// const BASE =  || 'http://localhost:5000/api';
const BASE = process.env.REACT_APP_API_URL || 'https://cft-be.onrender.com';

const API = axios.create({
  baseURL: BASE,
  withCredentials: true,
});
export default API;

