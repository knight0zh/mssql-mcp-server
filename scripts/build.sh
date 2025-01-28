#!/bin/bash

# Exit on error
set -e

echo "Building MSSQL MCP Server..."

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Run TypeScript compiler
echo "Compiling TypeScript..."
npm run build

# Make the build output executable
chmod +x build/index.js

echo "Build completed successfully!"
