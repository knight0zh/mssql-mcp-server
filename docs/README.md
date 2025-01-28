# MSSQL MCP Server

A Model Context Protocol (MCP) server for interacting with Microsoft SQL Server databases. This server provides tools for executing queries, listing databases and tables, and retrieving schema information.

## Features

- Execute SQL queries with support for parameters
- List available databases
- List tables in a database
- Get detailed table schema information
- Connection pooling for optimal performance
- Comprehensive error handling and reporting
- Security features including query sanitization and TLS support

## Installation

```bash
# Clone the repository
git clone [repository-url]
cd mssql-mcp-server

# Install dependencies
npm install
```

## Configuration

The server requires the following environment variables to be set in your MCP settings configuration:

```json
{
  "mcpServers": {
    "mssql": {
      "command": "node",
      "args": ["/path/to/mssql-mcp-server/build/index.js"],
      "env": {
        "MSSQL_HOST": "your-server-host",
        "MSSQL_PORT": "1433",
        "MSSQL_USER": "your-username",
        "MSSQL_PASSWORD": "your-password",
        "MSSQL_DATABASE": "optional-default-database",
        "MSSQL_ENCRYPT": "true",
        "MSSQL_TRUST_SERVER_CERTIFICATE": "false",
        "MSSQL_POOL_MAX": "10",
        "MSSQL_POOL_MIN": "0",
        "MSSQL_POOL_IDLE_TIMEOUT": "30000"
      }
    }
  }
}
```

## Available Tools

### query
Execute SQL queries against the database.

```json
{
  "query": "SELECT * FROM Users WHERE Age > @age",
  "params": {
    "age": 18
  },
  "database": "optional-different-database"
}
```

### list_databases
List all available databases.

```json
{
  "filter": "optional-name-pattern"
}
```

### list_tables
List all tables in a database.

```json
{
  "database": "database-name",
  "schema": "optional-schema-name",
  "filter": "optional-name-pattern"
}
```

### describe_table
Get detailed information about a table's schema.

```json
{
  "database": "database-name",
  "schema": "dbo",
  "table": "table-name"
}
```

## Error Handling

The server provides detailed error information including:
- SQL Server specific error codes
- Connection issues
- Query syntax errors
- Permission problems
- Resource limitations

Each error response includes:
- Error code
- Human-readable message
- Additional context when available
- Suggested resolution steps

## Security Considerations

- All queries are validated and sanitized
- Support for parameterized queries to prevent SQL injection
- TLS encryption for data in transit
- Connection pooling with configurable limits
- Credential management through environment variables

## Development

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines.

## License

MIT License - see [LICENSE](../LICENSE) for details
