module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie');
  res.setHeader('Access-Control-Expose-Headers', 'Set-Cookie');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const BACKEND_URL = process.env.BACKEND_URL || 'https://cft-cj43.onrender.com';
  const path = req.url.replace(/^\/api/, '') || '';
  const targetUrl = `${BACKEND_URL}/api${path}`;

  console.log(`[PROXY] ${req.method} ${req.url} -> ${targetUrl}`);

  try {
    const headers = { 'Content-Type': 'application/json' };
    
    if (req.headers.cookie) headers['Cookie'] = req.headers.cookie;
    if (req.headers.authorization) headers['Authorization'] = req.headers.authorization;

    const options = {
      method: req.method,
      headers,
    };
    
    if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
      options.body = JSON.stringify(req.body);
      console.log('[PROXY] Body:', options.body);
    }

    // Use native fetch
    const backendResponse = await fetch(targetUrl, options);
    
    console.log('[PROXY] Backend status:', backendResponse.status);
    
    // Get response data
    const contentType = backendResponse.headers.get('content-type') || '';
    let data;
    
    try {
      if (contentType.includes('application/json')) {
        data = await backendResponse.json();
      } else {
        data = await backendResponse.text();
      }
    } catch (parseErr) {
      console.error('[PROXY] Failed to parse response:', parseErr);
      data = { error: 'Failed to parse backend response' };
    }

    console.log('[PROXY] Response data:', data);

    // Handle cookies
    const setCookieHeader = backendResponse.headers.get('set-cookie');
    if (setCookieHeader) {
      const cookies = setCookieHeader.split(',').map(cookie => {
        let parts = cookie.split(';').map(p => p.trim());
        parts = parts.filter(part => !part.toLowerCase().startsWith('domain='));
        
        if (!parts.some(p => p.toLowerCase().startsWith('samesite='))) {
          parts.push('SameSite=None');
        }
        if (!parts.some(p => p.toLowerCase() === 'secure')) {
          parts.push('Secure');
        }
        
        return parts.join('; ');
      });
      
      res.setHeader('Set-Cookie', cookies);
      console.log('[PROXY] Cookies set');
    }

    res.status(backendResponse.status);
    return contentType.includes('application/json') ? res.json(data) : res.send(data);
    
  } catch (error) {
    console.error('[PROXY ERROR]:', error);
    return res.status(500).json({ 
      error: 'Proxy request failed', 
      details: error.message,
      targetUrl 
    });
  }
};