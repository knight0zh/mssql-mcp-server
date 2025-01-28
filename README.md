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

## Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)
- Access to a Microsoft SQL Server instance
- Docker (for running tests)

## Installation

1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd mssql-mcp-server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a configuration file:
   ```bash
   cp .env.example .env
   # Edit .env with your SQL Server credentials
   ```

4. Build the project:
   ```bash
   npm run build
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

See [Configuration Guide](docs/api/configuration.md) for detailed configuration options.

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

See [Tools Documentation](docs/api/tools.md) for detailed API documentation.

## Development

### Running Tests

The project includes both unit tests and integration tests. Integration tests require Docker to run a SQL Server instance.

```bash
# Run unit tests
npm test

# Run integration tests (requires Docker)
npm run test:integration

# Run tests with coverage
npm run test:coverage
```

### Code Style

The project uses ESLint and Prettier for code formatting:

```bash
# Run linter
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

### Scripts

- `npm run build` - Build the project
- `npm run start` - Start the server
- `npm run dev` - Start the server in development mode
- `npm run clean` - Clean build artifacts
- `npm run reinstall` - Clean and reinstall dependencies

## Documentation

- [Configuration Guide](docs/api/configuration.md)
- [Tools Documentation](docs/api/tools.md)
- [Error Handling](docs/api/error-handling.md)
- [Basic Examples](docs/examples/basic-queries.md)
- [Advanced Usage](docs/examples/advanced-usage.md)

## Contributing

Please read [CONTRIBUTING.md](docs/CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
