const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

app.use('/api', createProxyMiddleware({
  target: 'http://localhost:4950',
  changeOrigin: true,
  logLevel: 'debug',
  onProxyReq: (proxyReq, req, res) => {
    console.log(`→ Forwarding: ${req.method} ${req.url}`);
    
    // Forward cookies
    if (req.headers.cookie) {
      proxyReq.setHeader('cookie', req.headers.cookie);
    }
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`← Response: ${proxyRes.statusCode}`);
    
    // Log cookies being set
    const setCookie = proxyRes.headers['set-cookie'];
    if (setCookie) {
      console.log('← Cookie:', setCookie[0].substring(0, 50) + '...');
    }
  },
}));

app.listen(3001, () => {
  console.log('Proxy: http://localhost:3001 → Backend: http://localhost:4950');
});