#!/bin/bash

# Start DeerFlow's backend, CORS proxy, and web UI server.
# If the user presses Ctrl+C, kill all processes.

# Function to check if node.js is available
check_node() {
  # Check if node is available
  if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed. Please install Node.js to use the CORS proxy."
    exit 1
  fi
}

if [ "$1" = "--dev" -o "$1" = "-d" -o "$1" = "dev" -o "$1" = "development" ]; then
  echo -e "Starting DeerFlow in [DEVELOPMENT] mode with CORS proxy...\n"
  
  # Start the backend server
  echo "Starting backend server..."
  uv run server.py --host 0.0.0.0 --reload & SERVER_PID=$!
  
  # Start the simple CORS proxy server
  echo "Starting CORS proxy server..."
  check_node
  node simple-proxy.js & PROXY_PID=$!
  
  # Start the frontend server
  echo "Starting frontend server..."
  cd web && pnpm dev & WEB_PID=$!
  cd ..
  
  # Kill all processes when Ctrl+C is pressed
  trap "echo 'Stopping all services...' && kill $SERVER_PID $PROXY_PID $WEB_PID" SIGINT SIGTERM
  
  # Wait for all background processes
  wait
else
  echo -e "Starting DeerFlow in [PRODUCTION] mode...\n"
  
  # For production mode, still use the CORS proxy
  # Start the backend server
  uv run server.py --host 0.0.0.0 & SERVER_PID=$!
  
  # Start the simple CORS proxy server
  check_node
  node simple-proxy.js & PROXY_PID=$!
  
  # Start the frontend server
  cd web && pnpm start & WEB_PID=$!
  cd ..
  
  # Kill all processes when Ctrl+C is pressed
  trap "echo 'Stopping all services...' && kill $SERVER_PID $PROXY_PID $WEB_PID" SIGINT SIGTERM
  
  # Wait for all background processes
  wait
fi
