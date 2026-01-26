// src/utils/csrf.js
const isDev = process.env.NODE_ENV === 'development';

//same base URL logic as API
const API_BASE_URL = isDev 
  ? 'http://localhost:4950/api' 
  : 'https://api.carbonft.app/api';

let csrfToken = null;

export const fetchCsrfToken = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/csrf-token`, {
      method: 'GET',
      credentials: 'include',
    });
    
    if (!response.ok) throw new Error('Failed to fetch CSRF token');
    
    const data = await response.json();
    csrfToken = data.csrfToken;
    console.log('✅ CSRF token fetched:', csrfToken);
    return csrfToken;
  } catch (error) {
    console.error('❌ CSRF token fetch error:', error);
    throw error;
  }
};

export const getCsrfToken = () => csrfToken;

export const clearCsrfToken = () => {
  csrfToken = null;
};