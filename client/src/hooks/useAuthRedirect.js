import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/api';

const useAuthRedirect = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // 1️⃣ Try cookie-based auth first
        await API.get('/auth/token-info/me');

      } catch (err) {
        console.warn('⚠ Cookie auth failed, checking sessionStorage token...');

        // 2️⃣ Mobile fallback: check sessionStorage token
        const mobileToken = sessionStorage.getItem('sessionToken');
        if (mobileToken) {
          try {
            await API.get('/auth/token-info/me', {
              headers: { Authorization: `Bearer ${mobileToken}` }
            });
            console.log('✅ Mobile sessionStorage auth succeeded.');
            return; // success, stop redirect
          } catch (err2) {
            console.warn('❌ Mobile sessionStorage token invalid.');
          }
        }

        // 3️⃣ No valid auth → redirect
        console.warn('🔒 Redirecting to login due to invalid session.');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  return { loading };
};

export default useAuthRedirect;
