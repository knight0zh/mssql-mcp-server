# Basic Query Examples

This document provides examples of common query patterns using the MSSQL MCP Server.

## Simple Queries

### Select All Records
```json
{
  "tool": "query",
  "arguments": {
    "query": "SELECT * FROM Users"
  }
}
```

### Filter Records
```json
{
  "tool": "query",
  "arguments": {
    "query": "SELECT * FROM Products WHERE Price > @minPrice",
    "params": {
      "minPrice": 100
    }
  }
}
```

### Insert Record
```json
{
  "tool": "query",
  "arguments": {
    "query": "INSERT INTO Customers (Name, Email) VALUES (@name, @email)",
    "params": {
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

### Update Records
```json
{
  "tool": "query",
  "arguments": {
    "query": "UPDATE Orders SET Status = @status WHERE OrderId = @orderId",
    "params": {
      "status": "Shipped",
      "orderId": 12345
    }
  }
}
```

### Delete Records
```json
{
  "tool": "query",
  "arguments": {
    "query": "DELETE FROM Cart WHERE LastUpdated < @cutoffDate",
    "params": {
      "cutoffDate": "2024-01-01"
    }
  }
}
```

## Working with Different Databases

### Query Specific Database
```json
{
  "tool": "query",
  "arguments": {
    "database": "Inventory",
    "query": "SELECT * FROM Stock WHERE Quantity < @threshold",
    "params": {
      "threshold": 10
    }
  }
}
```

### List Available Databases
```json
{
  "tool": "list_databases",
  "arguments": {
    "filter": "Prod%"
  }
}
```

### List Tables in Database
```json
{
  "tool": "list_tables",
  "arguments": {
    "database": "Sales",
    "schema": "dbo",
    "filter": "Order%"
  }
}
```

## Schema Operations

### Get Table Schema
```json
{
  "tool": "describe_table",
  "arguments": {
    "database": "HR",
    "schema": "dbo",
    "table": "Employees"
  }
}
```

## Data Types

### Working with Dates
```json
{
  "tool": "query",
  "arguments": {
    "query": "SELECT * FROM Orders WHERE OrderDate BETWEEN @start AND @end",
    "params": {
      "start": "2024-01-01",
      "end": "2024-12-31"
    }
  }
}
```

### Binary Data
```json
{
  "tool": "query",
  "arguments": {
    "query": "INSERT INTO Documents (Name, Content) VALUES (@name, @content)",
    "params": {
      "name": "example.pdf",
      "content": Buffer.from("binary content")
    }
  }
}
```

### Decimal Values
```json
{
  "tool": "query",
  "arguments": {
    "query": "UPDATE Products SET Price = @price WHERE ProductId = @id",
    "params": {
      "price": 99.99,
      "id": 1
    }
  }
}
```

## Error Handling Examples

### Handle Missing Table
```json
{
  "tool": "query",
  "arguments": {
    "query": "SELECT * FROM NonExistentTable",
    "onError": {
      "action": "continue",
      "defaultValue": []
    }
  }
}
```

### Transaction Rollback
```json
{
  "tool": "query",
  "arguments": {
    "query": `
      BEGIN TRANSACTION;
      INSERT INTO Orders (CustomerId, Total) VALUES (@customerId, @total);
      UPDATE Inventory SET Stock = Stock - @quantity WHERE ProductId = @productId;
      COMMIT;
    `,
    "params": {
      "customerId": 1,
      "total": 150.00,
      "quantity": 2,
      "productId": 100
    },
    "onError": {
      "action": "rollback"
    }
  }
}
```

## Performance Optimization

### Using TOP for Limited Results
```json
{
  "tool": "query",
  "arguments": {
    "query": "SELECT TOP 10 * FROM Products ORDER BY Price DESC"
  }
}
```

### Pagination
```json
{
  "tool": "query",
  "arguments": {
    "query": `
      SELECT * FROM Orders 
      ORDER BY OrderDate DESC 
      OFFSET @offset ROWS 
      FETCH NEXT @pageSize ROWS ONLY
    `,
    "params": {
      "offset": 0,
      "pageSize": 20
    }
  }
}
```

### Optimized Joins
```json
{
  "tool": "query",
  "arguments": {
    "query": `
      SELECT o.OrderId, c.Name, p.ProductName
      FROM Orders o
      INNER JOIN Customers c ON o.CustomerId = c.CustomerId
      INNER JOIN Products p ON o.ProductId = p.ProductId
      WHERE o.OrderDate >= @since
    `,
    "params": {
      "since": "2024-01-01"
    }
  }
}
```

## Best Practices

1. **Always Use Parameters**
   - Prevents SQL injection
   - Improves query plan caching
   - Handles data type conversion

2. **Set Appropriate Timeouts**
   - Long-running queries
   - Background operations
   - Report generation

3. **Handle Transactions**
   - Use explicit transactions
   - Implement proper error handling
   - Consider isolation levels

4. **Optimize Performance**
   - Use appropriate indexes
   - Limit result sets
   - Implement pagination
   - Monitor query execution plans
