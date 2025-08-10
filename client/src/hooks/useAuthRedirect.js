import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/api';

const useAuthRedirect = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true); // optional: show spinner while checking

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await API.get('/auth/token-info/me'); // if this fails, user is not authenticated
      } catch (err) {
        console.warn('🔒 Redirecting to login due to invalid session.');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  return { loading }; // optional: use in your page to show loading UI
};

export default useAuthRedirect;
