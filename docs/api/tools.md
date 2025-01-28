# MSSQL MCP Server Tools Documentation

This document provides detailed information about each tool available in the MSSQL MCP Server.

## Tool: query

Execute SQL queries against the database with support for parameters.

### Input Schema
```typescript
{
  // The SQL query to execute
  query: string;
  
  // Optional parameters for the query
  params?: {
    [key: string]: string | number | boolean | Date | Buffer | null;
  };
  
  // Optional database name (overrides default)
  database?: string;
  
  // Optional timeout in milliseconds
  timeout?: number;
}
```

### Response Schema
```typescript
{
  // Array of result sets (for multiple statements)
  resultSets: Array<{
    // Array of records
    records: Array<Record<string, any>>;
    
    // Number of rows affected (for INSERT/UPDATE/DELETE)
    rowsAffected: number;
    
    // Metadata about the columns
    columns: Array<{
      name: string;
      type: string;
      nullable: boolean;
    }>;
  }>;
}
```

### Error Codes
- `INVALID_QUERY`: Invalid SQL syntax
- `PARAMETER_MISMATCH`: Missing or invalid parameters
- `DATABASE_NOT_FOUND`: Specified database doesn't exist
- `PERMISSION_DENIED`: Insufficient permissions
- `TIMEOUT`: Query execution timeout
- `CONNECTION_ERROR`: Database connection issues

### Examples

1. Basic SELECT query:
```json
{
  "query": "SELECT * FROM Users WHERE Active = 1"
}
```

2. Parameterized query:
```json
{
  "query": "INSERT INTO Users (Name, Email, Age) VALUES (@name, @email, @age)",
  "params": {
    "name": "John Doe",
    "email": "john@example.com",
    "age": 30
  }
}
```

3. Query with different database:
```json
{
  "query": "SELECT * FROM Products",
  "database": "Inventory"
}
```

## Tool: list_databases

List all available databases with optional filtering.

### Input Schema
```typescript
{
  // Optional filter pattern (SQL LIKE syntax)
  filter?: string;
}
```

### Response Schema
```typescript
{
  databases: Array<{
    name: string;
    size: number;
    owner: string;
    created: string;
    state: string;
  }>;
}
```

### Error Codes
- `PERMISSION_DENIED`: Insufficient permissions
- `INVALID_FILTER`: Invalid filter pattern
- `CONNECTION_ERROR`: Database connection issues

### Examples

1. List all databases:
```json
{}
```

2. Filter databases by pattern:
```json
{
  "filter": "Test%"
}
```

## Tool: list_tables

List all tables in a specified database.

### Input Schema
```typescript
{
  // Database name
  database: string;
  
  // Optional schema name (defaults to 'dbo')
  schema?: string;
  
  // Optional filter pattern (SQL LIKE syntax)
  filter?: string;
}
```

### Response Schema
```typescript
{
  tables: Array<{
    name: string;
    schema: string;
    type: string;
    rowCount: number;
    created: string;
    modified: string;
  }>;
}
```

### Error Codes
- `DATABASE_NOT_FOUND`: Specified database doesn't exist
- `SCHEMA_NOT_FOUND`: Specified schema doesn't exist
- `PERMISSION_DENIED`: Insufficient permissions
- `INVALID_FILTER`: Invalid filter pattern
- `CONNECTION_ERROR`: Database connection issues

### Examples

1. List all tables in default schema:
```json
{
  "database": "Northwind"
}
```

2. List tables in specific schema with filter:
```json
{
  "database": "Northwind",
  "schema": "sales",
  "filter": "Order%"
}
```

## Tool: describe_table

Get detailed schema information about a specific table.

### Input Schema
```typescript
{
  // Database name
  database: string;
  
  // Schema name (defaults to 'dbo')
  schema?: string;
  
  // Table name
  table: string;
}
```

### Response Schema
```typescript
{
  table: {
    name: string;
    schema: string;
    columns: Array<{
      name: string;
      type: string;
      nullable: boolean;
      default: string | null;
      isPrimary: boolean;
      isIdentity: boolean;
      length: number | null;
      precision: number | null;
      scale: number | null;
    }>;
    indexes: Array<{
      name: string;
      type: string;
      columns: string[];
      isUnique: boolean;
      isClustered: boolean;
    }>;
    foreignKeys: Array<{
      name: string;
      columns: string[];
      referencedTable: string;
      referencedSchema: string;
      referencedColumns: string[];
      onUpdate: string;
      onDelete: string;
    }>;
    triggers: Array<{
      name: string;
      type: string;
      definition: string;
    }>;
  };
}
```

### Error Codes
- `DATABASE_NOT_FOUND`: Specified database doesn't exist
- `SCHEMA_NOT_FOUND`: Specified schema doesn't exist
- `TABLE_NOT_FOUND`: Specified table doesn't exist
- `PERMISSION_DENIED`: Insufficient permissions
- `CONNECTION_ERROR`: Database connection issues

### Examples

1. Describe table in default schema:
```json
{
  "database": "Northwind",
  "table": "Customers"
}
```

2. Describe table in specific schema:
```json
{
  "database": "Northwind",
  "schema": "sales",
  "table": "Orders"
}
```

## Best Practices

1. **Query Tool**
   - Use parameters instead of string concatenation
   - Set appropriate timeouts for long-running queries
   - Handle multiple result sets when needed
   - Use transactions for data modifications

2. **List Operations**
   - Use filters to reduce result sets
   - Handle pagination for large results
   - Consider permissions when listing objects

3. **Schema Information**
   - Cache schema information when appropriate
   - Check for schema changes
   - Handle large object definitions

4. **Error Handling**
   - Always check for specific error codes
   - Handle connection issues gracefully
   - Provide meaningful error messages
   - Implement proper logging

5. **Security**
   - Validate all input parameters
   - Use minimum required permissions
   - Implement proper access control
   - Handle sensitive data appropriately
