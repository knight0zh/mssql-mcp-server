# Docker Setup for MSSQL MCP Server

This document explains how to use Docker with the MSSQL MCP Server for both development and production environments.

## Prerequisites

- Docker
- Docker Compose
- Git

## Development Environment

The development environment uses `docker-compose.yml` and `Dockerfile.dev` to create a development-friendly setup with hot reloading.

### Starting the Development Environment

```bash
# Start the development environment
docker-compose up

# Start in detached mode
docker-compose up -d

# View logs if running in detached mode
docker-compose logs -f
```

### Development Container Features

- Hot reloading using nodemon
- Source code mounted as a volume
- SQL Server tools installed for debugging
- Development dependencies included
- Environment variables configured for local development

### Accessing SQL Server

```bash
# Connect using sqlcmd in the mssql container
docker-compose exec mssql /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P YourStrongPassword123!

# Or connect using your preferred SQL client:
Host: localhost
Port: 1433
User: sa
Password: YourStrongPassword123!
```

## Production Environment

The production environment uses the main `Dockerfile` which creates a minimal production image using multi-stage builds.

### Building the Production Image

```bash
# Build the production image
docker build -t mssql-mcp-server:latest .

# Run the production container
docker run -d \
  --name mssql-mcp-server \
  -e MSSQL_HOST=your-sql-server \
  -e MSSQL_PORT=1433 \
  -e MSSQL_USER=your-user \
  -e MSSQL_PASSWORD=your-password \
  mssql-mcp-server:latest
```

### Production Container Features

- Multi-stage build for minimal image size
- Production dependencies only
- SQL Server tools included for diagnostics
- Optimized for production use

## Environment Variables

Both development and production environments support the following environment variables:

```bash
MSSQL_HOST=hostname
MSSQL_PORT=1433
MSSQL_USER=username
MSSQL_PASSWORD=password
MSSQL_DATABASE=database
MSSQL_ENCRYPT=true/false
MSSQL_TRUST_SERVER_CERTIFICATE=true/false
```

## Docker Compose Commands

```bash
# Start services
docker-compose up

# Stop services
docker-compose down

# Rebuild services
docker-compose up --build

# View logs
docker-compose logs

# Execute command in service
docker-compose exec app npm run test

# View running services
docker-compose ps
```

## Data Persistence

SQL Server data is persisted using a named volume `mssql-data`. This ensures your data survives container restarts.

To manage the volume:

```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect mssql-data

# Remove volume (WARNING: This will delete all data!)
docker volume rm mssql-data
```

## Troubleshooting

### Common Issues

1. **SQL Server Connection Issues**
   ```bash
   # Check if SQL Server is running
   docker-compose ps
   
   # View SQL Server logs
   docker-compose logs mssql
   ```

2. **Permission Issues**
   ```bash
   # Reset SQL Server password
   docker-compose exec mssql /opt/mssql-tools/bin/sqlcmd \
     -S localhost -U SA -P YourStrongPassword123! \
     -Q "ALTER LOGIN sa WITH PASSWORD='NewPassword123!'"
   ```

3. **Container Won't Start**
   ```bash
   # Check container logs
   docker-compose logs app
   
   # Verify environment variables
   docker-compose config
   ```

### Health Checks

The SQL Server container includes health checks to ensure the database is ready before starting the application. You can monitor the health status:

```bash
docker inspect --format='{{json .State.Health}}' $(docker-compose ps -q mssql)
```

## Security Notes

- Change default passwords in production
- Use secrets management in production
- Enable encryption for production environments
- Follow least privilege principle for SQL Server accounts
- Regularly update base images and dependencies
