// api/[...path].js
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Cookie');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const BACKEND_URL = process.env.BACKEND_URL || 'https://cft-cj43.onrender.com';
  const path = req.url.replace(/^\/api/, '');
  const targetUrl = `${BACKEND_URL}/api${path}`;

  console.log(`[PROXY] ${req.method} -> ${targetUrl}`);

  try {
    const headers = { 'Content-Type': 'application/json' };
    
    if (req.headers.cookie) {
      headers['Cookie'] = req.headers.cookie;
    }

    const options = { method: req.method, headers };
    
    if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
      options.body = JSON.stringify(req.body);
    }

    const fetch = (await import('node-fetch')).default;
    const backendResponse = await fetch(targetUrl, options);
    const contentType = backendResponse.headers.get('content-type') || '';
    
    let data;
    if (contentType.includes('application/json')) {
      data = await backendResponse.json();
    } else {
      data = await backendResponse.text();
    }

    const setCookie = backendResponse.headers.get('set-cookie');
    if (setCookie) {
      console.log('[PROXY] Setting cookie');
      const cleanCookie = setCookie.split(';')
        .filter(part => !part.trim().toLowerCase().startsWith('domain='))
        .join('; ');
      res.setHeader('Set-Cookie', cleanCookie);
    }

    res.status(backendResponse.status);
    return contentType.includes('application/json') ? res.json(data) : res.send(data);
  } catch (error) {
    console.error('[PROXY ERROR]:', error.message);
    return res.status(500).json({ error: 'Proxy failed', details: error.message });
  }
};