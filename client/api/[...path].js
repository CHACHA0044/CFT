// api/[...path].js
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
  
  // Correctly extract path and preserve query string
  const urlParts = req.url.split('?');
  const path = urlParts[0].replace(/^\/api/, '');
  const queryString = urlParts[1] ? `?${urlParts[1]}` : '';
  const targetUrl = `${BACKEND_URL}/api${path}${queryString}`;

  console.log(`[PROXY] ${req.method} ${req.url} -> ${targetUrl}`);

  try {
    const headers = { 'Content-Type': 'application/json' };
    
    if (req.headers.cookie) {
      headers['Cookie'] = req.headers.cookie;
      console.log('[PROXY] Forwarding cookies');
    }
    
    if (req.headers.authorization) {
      headers['Authorization'] = req.headers.authorization;
    }

    const options = { method: req.method, headers };
    
    // Vercel parses req.body automatically - just use it
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      if (req.body && Object.keys(req.body).length > 0) {
        options.body = JSON.stringify(req.body);
        console.log('[PROXY] Body:', JSON.stringify(req.body).substring(0, 100));
      }
    }

    // Use native fetch (Node 18+ in Vercel)
    const backendResponse = await fetch(targetUrl, options);
    
    console.log('[PROXY] Status:', backendResponse.status);
    
    const contentType = backendResponse.headers.get('content-type') || '';
    let data;
    
    try {
      if (contentType.includes('application/json')) {
        data = await backendResponse.json();
      } else {
        data = await backendResponse.text();
      }
    } catch (parseErr) {
      console.error('[PROXY] Parse error:', parseErr.message);
      data = { error: 'Failed to parse backend response' };
    }

    // Handle Set-Cookie headers properly
    const setCookieHeader = backendResponse.headers.get('set-cookie');
    if (setCookieHeader) {
      console.log('[PROXY] Setting cookies');
      
      // Split multiple cookies properly (they're comma-separated)
      const cookies = setCookieHeader.split(/,(?=[^;]+=[^;])/);
      
      const modifiedCookies = cookies.map(cookie => {
        let parts = cookie.split(';').map(p => p.trim());
        
        // Remove Domain attribute
        parts = parts.filter(p => !p.toLowerCase().startsWith('domain='));
        
        // Ensure SameSite=None and Secure for cross-origin
        const hasSameSite = parts.some(p => p.toLowerCase().startsWith('samesite='));
        const hasSecure = parts.some(p => p.toLowerCase() === 'secure');
        
        if (!hasSameSite) parts.push('SameSite=None');
        if (!hasSecure) parts.push('Secure');
        
        return parts.join('; ');
      });
      
      res.setHeader('Set-Cookie', modifiedCookies);
      console.log('[PROXY] Cookies modified:', modifiedCookies.length);
    }

    res.status(backendResponse.status);
    return contentType.includes('application/json') ? res.json(data) : res.send(data);
    
  } catch (error) {
    console.error('[PROXY ERROR]:', error.message);
    console.error('[PROXY STACK]:', error.stack);
    return res.status(500).json({ 
      error: 'Proxy request failed', 
      details: error.message,
      targetUrl 
    });
  }
};