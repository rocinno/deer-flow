// A very simple CORS proxy server with minimal dependencies
const http = require('http');
const https = require('https');
const url = require('url');

// Configuration
const PORT = 3001;
const TARGET_HOST = '34.136.71.19';
const TARGET_PORT = 8000;

// Debug helper
function debug(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

// Create the server
const server = http.createServer((req, res) => {
  // Log all incoming requests
  debug(`Received ${req.method} request for ${req.url}`);

  // Set CORS headers for all responses
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With, X-CSRF-Token, Cache-Control');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours

  // Always respond to OPTIONS requests directly from the proxy
  if (req.method === 'OPTIONS') {
    debug('Responding to OPTIONS preflight request directly');
    res.writeHead(200);
    res.end();
    return;
  }

  // Handle health check requests
  if (req.url === '/health') {
    debug('Health check request');
    res.writeHead(200);
    res.end('Proxy server is running');
    return;
  }

  // Fix the path handling to account for various URL formats
  let targetPath;
  const parsedUrl = url.parse(req.url);
  
  // Handle both /proxy/api/path and /proxy/path formats
  if (parsedUrl.path.startsWith('/proxy/api/')) {
    targetPath = parsedUrl.path.replace('/proxy/api/', '/api/');
  } else if (parsedUrl.path.startsWith('/proxy/')) {
    targetPath = '/api/' + parsedUrl.path.replace('/proxy/', '');
  } else {
    targetPath = '/api' + parsedUrl.path;
  }
  
  debug(`Proxying request to: http://${TARGET_HOST}:${TARGET_PORT}${targetPath}`);

  // Prepare the proxy request options
  const options = {
    hostname: TARGET_HOST,
    port: TARGET_PORT,
    path: targetPath,
    method: req.method,
    headers: {
      // Don't forward hostname to avoid confusing the target server
      'user-agent': req.headers['user-agent'] || 'CORS-Proxy/1.0',
      'content-type': req.headers['content-type'] || 'application/json',
      'accept': req.headers['accept'] || '*/*',
      'cache-control': req.headers['cache-control'] || 'no-cache'
    }
  };

  // Create proxy request
  const proxyReq = http.request(options, (proxyRes) => {
    debug(`Received response from target with status: ${proxyRes.statusCode}`);
    
    // Copy response headers
    Object.keys(proxyRes.headers).forEach(key => {
      res.setHeader(key, proxyRes.headers[key]);
    });
    
    // Set CORS headers again to ensure they're not overwritten
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With, X-CSRF-Token, Cache-Control');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    // Set response status code
    res.writeHead(proxyRes.statusCode);
    
    // Pipe the response data
    proxyRes.pipe(res, { end: true });
  });

  // Handle proxy request errors
  proxyReq.on('error', (err) => {
    debug(`Proxy request error: ${err.message}`);
    console.error('Proxy request error:', err);
    
    // Send a friendly error response
    res.setHeader('Content-Type', 'text/plain');
    res.writeHead(502);
    res.end(`Proxy error: Could not connect to backend at ${TARGET_HOST}:${TARGET_PORT}\n\nError details: ${err.message}`);
  });

  // Copy request body for debugging if needed
  let requestBody = '';
  req.on('data', chunk => {
    requestBody += chunk;
  });

  req.on('end', () => {
    if (requestBody && ['POST', 'PUT', 'PATCH'].includes(req.method)) {
      debug(`Request body: ${requestBody.length > 100 ? requestBody.substring(0, 100) + '...' : requestBody}`);
    }
    
    // End the proxy request
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      proxyReq.write(requestBody);
    }
    proxyReq.end();
  });
});

// Start the server
server.listen(PORT, '0.0.0.0', () => {
  debug(`Simple CORS proxy server running at http://0.0.0.0:${PORT}`);
});