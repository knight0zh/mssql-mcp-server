#!/bin/bash

# Exit on error
set -e

echo "Running MSSQL MCP Server tests..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo "Docker is not running. Please start Docker and try again."
  exit 1
fi

# Start SQL Server container for testing
echo "Starting SQL Server container..."
docker run -d \
  --name mssql-test \
  -e "ACCEPT_EULA=Y" \
  -e "SA_PASSWORD=YourTestPassword123!" \
  -p 1433:1433 \
  mcr.microsoft.com/mssql/server:2022-latest

# Wait for SQL Server to be ready
echo "Waiting for SQL Server to be ready..."
sleep 20

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Run tests
echo "Running tests..."
npm test

# Cleanup
echo "Cleaning up..."
docker stop mssql-test
docker rm mssql-test

echo "Tests completed!"
