# Configuration Guide

This document details the configuration options available for the MSSQL MCP Server.

## Environment Variables

The server uses environment variables for configuration. These are set in the MCP settings configuration file.

### Required Variables

#### Connection Settings
```typescript
MSSQL_HOST="your-server-host"
// SQL Server hostname or IP address
// Example: "localhost" or "database.example.com"

MSSQL_PORT="1433"
// SQL Server port number
// Default: 1433

MSSQL_USER="your-username"
// SQL Server authentication username
// Example: "sa" or "app_user"

MSSQL_PASSWORD="your-password"
// SQL Server authentication password
```

### Optional Variables

#### Database Settings
```typescript
MSSQL_DATABASE="default-database"
// Default database to connect to
// If not specified, must be provided in each query
// Example: "master" or "application_db"

MSSQL_SCHEMA="default-schema"
// Default schema to use
// Default: "dbo"
```

#### Security Settings
```typescript
MSSQL_ENCRYPT="true"
// Enable/disable connection encryption
// Default: true
// Values: "true" or "false"

MSSQL_TRUST_SERVER_CERTIFICATE="false"
// Trust self-signed certificates
// Default: false
// Values: "true" or "false"

MSSQL_ENABLE_ARITH_ABORT="true"
// Set ARITHABORT property
// Default: true
// Values: "true" or "false"
```

#### Connection Pool Settings
```typescript
MSSQL_POOL_MAX="10"
// Maximum number of connections in pool
// Default: 10
// Range: 1-1000

MSSQL_POOL_MIN="0"
// Minimum number of connections in pool
// Default: 0
// Range: 0-1000

MSSQL_POOL_IDLE_TIMEOUT="30000"
// Time (ms) before idle connections are closed
// Default: 30000 (30 seconds)
// Range: 1000-3600000

MSSQL_POOL_ACQUIRE_TIMEOUT="15000"
// Time (ms) to wait for connection from pool
// Default: 15000 (15 seconds)
// Range: 1000-60000
```

#### Query Settings
```typescript
MSSQL_QUERY_TIMEOUT="30000"
// Default query timeout in milliseconds
// Default: 30000 (30 seconds)
// Range: 1000-3600000

MSSQL_MULTIPLE_STATEMENTS="false"
// Allow multiple statements in single query
// Default: false
// Values: "true" or "false"

MSSQL_ROWS_AS_ARRAY="false"
// Return rows as arrays instead of objects
// Default: false
// Values: "true" or "false"
```

#### Debug Settings
```typescript
MSSQL_DEBUG="false"
// Enable debug logging
// Default: false
// Values: "true" or "false"

MSSQL_DEBUG_SQL="false"
// Log SQL queries
// Default: false
// Values: "true" or "false"
```

## MCP Settings Configuration

Example configuration in MCP settings file:

```json
{
  "mcpServers": {
    "mssql": {
      "command": "node",
      "args": ["/path/to/mssql-mcp-server/build/index.js"],
      "env": {
        "MSSQL_HOST": "localhost",
        "MSSQL_PORT": "1433",
        "MSSQL_USER": "sa",
        "MSSQL_PASSWORD": "YourStrongPassword123",
        "MSSQL_DATABASE": "master",
        "MSSQL_ENCRYPT": "true",
        "MSSQL_TRUST_SERVER_CERTIFICATE": "false",
        "MSSQL_POOL_MAX": "10",
        "MSSQL_POOL_MIN": "0",
        "MSSQL_POOL_IDLE_TIMEOUT": "30000",
        "MSSQL_QUERY_TIMEOUT": "30000",
        "MSSQL_DEBUG": "false"
      }
    }
  }
}
```

## Connection String Format

The server internally constructs a connection string using the provided environment variables. The format is:

```
Server=#{MSSQL_HOST},#{MSSQL_PORT};Database=#{MSSQL_DATABASE};User Id=#{MSSQL_USER};Password=#{MSSQL_PASSWORD};Encrypt=#{MSSQL_ENCRYPT};TrustServerCertificate=#{MSSQL_TRUST_SERVER_CERTIFICATE};
```

## Configuration Best Practices

### Security
1. **Encryption**
   - Always enable encryption in production
   - Use trusted certificates
   - Avoid trusting self-signed certificates

2. **Authentication**
   - Use strong passwords
   - Consider using integrated security
   - Rotate credentials regularly

3. **Network**
   - Use firewalls to restrict access
   - Configure proper port settings
   - Enable TLS/SSL

### Performance
1. **Connection Pool**
   - Set appropriate pool size
   - Configure idle timeout
   - Monitor pool usage

2. **Query Settings**
   - Set reasonable timeouts
   - Enable multiple statements only if needed
   - Monitor query performance

3. **Resource Management**
   - Configure minimum connections
   - Set maximum connections
   - Monitor resource usage

### Development
1. **Debug Settings**
   - Enable debug logging in development
   - Log SQL queries during testing
   - Disable in production

2. **Error Handling**
   - Configure proper timeouts
   - Enable detailed errors in development
   - Use production-safe error messages

## Environment-Specific Configurations

### Development
```json
{
  "MSSQL_HOST": "localhost",
  "MSSQL_TRUST_SERVER_CERTIFICATE": "true",
  "MSSQL_DEBUG": "true",
  "MSSQL_DEBUG_SQL": "true",
  "MSSQL_POOL_MAX": "5"
}
```

### Testing
```json
{
  "MSSQL_HOST": "test-db",
  "MSSQL_POOL_MAX": "5",
  "MSSQL_DEBUG": "true",
  "MSSQL_QUERY_TIMEOUT": "5000"
}
```

### Production
```json
{
  "MSSQL_HOST": "prod-db",
  "MSSQL_ENCRYPT": "true",
  "MSSQL_TRUST_SERVER_CERTIFICATE": "false",
  "MSSQL_DEBUG": "false",
  "MSSQL_POOL_MAX": "20"
}
```

## Troubleshooting

### Common Issues

1. **Connection Failures**
   - Verify host and port
   - Check credentials
   - Confirm firewall settings
   - Verify SSL/TLS configuration

2. **Pool Issues**
   - Check pool size settings
   - Monitor connection usage
   - Verify timeout settings
   - Check for connection leaks

3. **Performance Problems**
   - Review pool configuration
   - Check query timeouts
   - Monitor resource usage
   - Optimize connection settings

### Configuration Validation

The server validates configuration on startup:
- Checks required variables
- Validates value ranges
- Verifies format of values
- Tests database connection
