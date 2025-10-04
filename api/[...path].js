// api/[...path].js
module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie');
  res.setHeader('Access-Control-Expose-Headers', 'Set-Cookie');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const BACKEND_URL = process.env.BACKEND_URL || 'https://cft-cj43.onrender.com';
  
  // Extract path from URL
  const urlParts = req.url.split('?');
  const path = urlParts[0].replace(/^\/api/, '');
  const queryString = urlParts[1] ? `?${urlParts[1]}` : '';
  const targetUrl = `${BACKEND_URL}/api${path}${queryString}`;

  console.log(`[PROXY] ${req.method} -> ${targetUrl}`);

  try {
    const fetch = (await import('node-fetch')).default;
    
    // Build headers
    const headers = {
      'Content-Type': 'application/json',
    };
    
    // Forward cookies from client
    if (req.headers.cookie) {
      headers['Cookie'] = req.headers.cookie;
      console.log('[PROXY] Forwarding cookies:', req.headers.cookie.substring(0, 50) + '...');
    }

    // Forward authorization header
    if (req.headers.authorization) {
      headers['Authorization'] = req.headers.authorization;
    }

    // Build request options
    const options = {
      method: req.method,
      headers,
      credentials: 'include', // Important for cookies
    };
    
    // Add body for non-GET/HEAD requests
    if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
      options.body = JSON.stringify(req.body);
      console.log('[PROXY] Request body:', JSON.stringify(req.body).substring(0, 100));
    }

    // Make request to backend
    const backendResponse = await fetch(targetUrl, options);
    const contentType = backendResponse.headers.get('content-type') || '';
    
    console.log('[PROXY] Backend status:', backendResponse.status);
    
    // Parse response
    let data;
    if (contentType.includes('application/json')) {
      data = await backendResponse.json();
    } else {
      data = await backendResponse.text();
    }

    // Handle Set-Cookie headers
    const setCookieHeaders = backendResponse.headers.raw()['set-cookie'];
    if (setCookieHeaders && setCookieHeaders.length > 0) {
      console.log('[PROXY] Setting cookies:', setCookieHeaders.length);
      
      // Modify cookies to work with Vercel domain
      const modifiedCookies = setCookieHeaders.map(cookie => {
        // Parse the cookie
        const parts = cookie.split(';').map(p => p.trim());
        const filtered = parts.filter(part => {
          const lower = part.toLowerCase();
          // Remove Domain attribute (let browser set it automatically)
          return !lower.startsWith('domain=');
        });
        
        // For production, ensure SameSite=None and Secure
        if (process.env.NODE_ENV === 'production') {
          // Check if SameSite is already set
          const hasSameSite = filtered.some(p => p.toLowerCase().startsWith('samesite='));
          const hasSecure = filtered.some(p => p.toLowerCase() === 'secure');
          
          if (!hasSameSite) {
            filtered.push('SameSite=None');
          } else {
            // Update existing SameSite to None
            const idx = filtered.findIndex(p => p.toLowerCase().startsWith('samesite='));
            if (idx !== -1) filtered[idx] = 'SameSite=None';
          }
          
          if (!hasSecure) {
            filtered.push('Secure');
          }
        }
        
        return filtered.join('; ');
      });
      
      res.setHeader('Set-Cookie', modifiedCookies);
      console.log('[PROXY] Modified cookies:', modifiedCookies);
    }

    // Forward other headers
    const allowedHeaders = ['content-type', 'cache-control', 'etag'];
    allowedHeaders.forEach(header => {
      const value = backendResponse.headers.get(header);
      if (value) res.setHeader(header, value);
    });

    // Send response
    res.status(backendResponse.status);
    return contentType.includes('application/json') ? res.json(data) : res.send(data);
    
  } catch (error) {
    console.error('[PROXY ERROR]:', error.message);
    console.error('[PROXY ERROR STACK]:', error.stack);
    return res.status(500).json({ 
      error: 'Proxy failed', 
      details: error.message,
      url: targetUrl 
    });
  }
};