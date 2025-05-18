#!/bin/bash
cd /home/cpc_sz_tt/projects/deer-flow

# Check if dependencies are installed
if [ ! -d "node_modules" ] || [ ! -d "node_modules/express" ]; then
  echo "Installing proxy dependencies..."
  npm install --prefix ./proxy-deps express cors http-proxy-middleware
  ln -sf ./proxy-deps/node_modules ./node_modules
fi

# Run the proxy
echo "Starting CORS proxy on port 3001..."
node cors-proxy.js