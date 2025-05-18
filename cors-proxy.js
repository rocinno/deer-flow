// Simple CORS Proxy Server to bypass CORS restrictions
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const app = express();

// Configure CORS
app.use(cors({
  origin: true, // Allow all origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With', 'X-CSRF-Token', 'Cache-Control']
}));

// Handle OPTIONS requests explicitly to ensure they work
app.options('*', cors());

// Forward requests to the backend
const apiProxy = createProxyMiddleware({
  target: 'http://34.136.71.19:8000',
  changeOrigin: true,
  // Fix: Don't use pathRewrite with a regex pattern that causes issues
  pathRewrite: function (path) {
    return path.replace('/proxy', '');
  },
  onProxyRes: (proxyRes, req, res) => {
    // Add CORS headers to response
    proxyRes.headers['Access-Control-Allow-Origin'] = '*';
    proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS, PATCH';
    proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, Accept, Origin, X-Requested-With, X-CSRF-Token, Cache-Control';
    proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
  }
});

// Create a simple health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('Proxy is running');
});

// Apply proxy to all routes under /proxy
app.use('/proxy', apiProxy);

// Start the server
const PORT = 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`CORS Proxy server running at http://0.0.0.0:${PORT}`);
});