#!/bin/bash

# Exit on error
set -e

echo "Setting up MSSQL MCP Server development environment..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Error: Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "Error: Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2)
if [ "$(printf '%s\n' "18.0.0" "$NODE_VERSION" | sort -V | head -n1)" = "18.0.0" ]; then
    echo "Node.js version $NODE_VERSION detected (OK)"
else
    echo "Error: Node.js version 18.0.0 or higher is required"
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cp .env.example .env
    echo "Please edit .env file with your configuration"
fi

# Install dependencies
echo "Installing dependencies..."
npm install

# Create data directories if they don't exist
echo "Creating data directories..."
mkdir -p data/mssql

# Pull required Docker images
echo "Pulling Docker images..."
docker pull mcr.microsoft.com/mssql/server:2022-latest

# Build development containers
echo "Building development containers..."
docker-compose build

echo "Setting up Git hooks..."
npm run prepare

echo "Running linter..."
npm run lint

echo "Running tests..."
npm test

echo "Setup complete!"
echo ""
echo "To start the development environment:"
echo "1. Make sure Docker is running"
echo "2. Run: docker-compose up"
echo ""
echo "To run tests:"
echo "- Unit tests: npm test"
echo "- Integration tests: npm run test:integration"
echo ""
echo "To clean up:"
echo "- Stop containers: docker-compose down"
echo "- Remove volumes: docker-compose down -v"
echo ""
echo "Documentation available in:"
echo "- docs/README.md: Main documentation"
echo "- docker/README.md: Docker setup guide"
echo "- docs/api/: API documentation"
echo "- docs/examples/: Usage examples"
