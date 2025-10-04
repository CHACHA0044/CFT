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
  
  const urlParts = req.url.split('?');
  const path = urlParts[0].replace(/^\/api/, '');
  const queryString = urlParts[1] ? `?${urlParts[1]}` : '';
  const targetUrl = `${BACKEND_URL}/api${path}${queryString}`;

  console.log(`[PROXY] ${req.method} -> ${targetUrl}`);

  try {
    const fetch = (await import('node-fetch')).default;
    
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (req.headers.cookie) {
      headers['Cookie'] = req.headers.cookie;
      console.log('[PROXY] Forwarding cookies');
    }

    if (req.headers.authorization) {
      headers['Authorization'] = req.headers.authorization;
    }

    const options = {
      method: req.method,
      headers,
    };
    
    // FIX: Vercel already parses req.body, just use it directly
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      if (req.body && Object.keys(req.body).length > 0) {
        options.body = JSON.stringify(req.body);
        console.log('[PROXY] Body:', JSON.stringify(req.body));
      }
    }

    const backendResponse = await fetch(targetUrl, options);
    const contentType = backendResponse.headers.get('content-type') || '';
    
    console.log('[PROXY] Status:', backendResponse.status);
    
    let data;
    if (contentType.includes('application/json')) {
      data = await backendResponse.json();
    } else {
      data = await backendResponse.text();
    }

    const setCookieHeaders = backendResponse.headers.raw()['set-cookie'];
    if (setCookieHeaders && setCookieHeaders.length > 0) {
      console.log('[PROXY] Setting cookies');
      
      const modifiedCookies = setCookieHeaders.map(cookie => {
        const parts = cookie.split(';').map(p => p.trim());
        const filtered = parts.filter(part => !part.toLowerCase().startsWith('domain='));
        
        // Force SameSite=None and Secure for production
        const hasSameSite = filtered.some(p => p.toLowerCase().startsWith('samesite='));
        const hasSecure = filtered.some(p => p.toLowerCase() === 'secure');
        
        if (!hasSameSite) filtered.push('SameSite=None');
        if (!hasSecure) filtered.push('Secure');
        
        return filtered.join('; ');
      });
      
      res.setHeader('Set-Cookie', modifiedCookies);
    }

    res.status(backendResponse.status);
    return contentType.includes('application/json') ? res.json(data) : res.send(data);
    
  } catch (error) {
    console.error('[PROXY ERROR]:', error.message);
    return res.status(500).json({ 
      error: 'Proxy failed', 
      details: error.message 
    });
  }
};