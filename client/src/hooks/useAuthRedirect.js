// client/src/hooks/useAuthRedirect.js
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/api';

const useAuthRedirect = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        await API.get('/auth/token-info/me');
        
        if (isMounted) {
          console.log('✅ Cookie authentication successful');
          setIsAuthenticated(true);
        }
        
      } catch (err) {
        console.warn('❌ Cookie authentication failed:', err.response?.status);
        
        if (isMounted) {
          setIsAuthenticated(false);
          
          if (err.response?.status === 401 || err.response?.status === 403) {
            console.warn('🔒 Redirecting to login due to invalid session.');
            navigate('/login', { replace: true });
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  return { loading, isAuthenticated };
};

export default useAuthRedirect;