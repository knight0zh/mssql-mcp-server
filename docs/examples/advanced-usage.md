# Advanced Usage Examples

This document demonstrates advanced usage patterns and complex scenarios for the MSSQL MCP Server.

## Complex Transactions

### Multi-Table Transaction with Error Handling
```json
{
  "tool": "query",
  "arguments": {
    "query": `
      BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Create order
        INSERT INTO Orders (CustomerId, OrderDate, Total)
        VALUES (@customerId, GETDATE(), @total);
        
        DECLARE @orderId INT = SCOPE_IDENTITY();
        
        -- Insert order items
        INSERT INTO OrderItems (OrderId, ProductId, Quantity, Price)
        SELECT 
          @orderId,
          ProductId,
          Quantity,
          CurrentPrice
        FROM @orderItems;
        
        -- Update inventory
        UPDATE Inventory
        SET StockQuantity = StockQuantity - i.Quantity
        FROM Inventory inv
        INNER JOIN @orderItems i ON inv.ProductId = i.ProductId;
        
        -- Update customer stats
        UPDATE CustomerStats
        SET 
          TotalOrders = TotalOrders + 1,
          LastOrderDate = GETDATE()
        WHERE CustomerId = @customerId;
        
        COMMIT TRANSACTION;
      END TRY
      BEGIN CATCH
        IF @@TRANCOUNT > 0
          ROLLBACK TRANSACTION;
          
        THROW;
      END CATCH
    `,
    "params": {
      "customerId": 1001,
      "total": 525.75,
      "orderItems": [
        { "ProductId": 1, "Quantity": 2, "CurrentPrice": 99.99 },
        { "ProductId": 2, "Quantity": 1, "CurrentPrice": 325.77 }
      ]
    }
  }
}
```

## Dynamic SQL Generation

### Dynamic Column Selection
```json
{
  "tool": "query",
  "arguments": {
    "query": `
      DECLARE @columns NVARCHAR(MAX);
      DECLARE @sql NVARCHAR(MAX);
      
      SELECT @columns = STRING_AGG(QUOTENAME(column_name), ',')
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE 
        TABLE_SCHEMA = @schema
        AND TABLE_NAME = @table
        AND column_name IN (SELECT value FROM STRING_SPLIT(@selectedColumns, ','));
      
      SET @sql = N'SELECT ' + @columns + ' FROM ' + QUOTENAME(@schema) + '.' + QUOTENAME(@table) + 
                 ' WHERE ' + @whereClause;
      
      EXEC sp_executesql @sql, 
           N'@param1 int', 
           @param1 = @value;
    `,
    "params": {
      "schema": "dbo",
      "table": "Products",
      "selectedColumns": "ProductId,Name,Price,Category",
      "whereClause": "CategoryId = @param1",
      "value": 5
    }
  }
}
```

## Stored Procedure Integration

### Execute Stored Procedure
```json
{
  "tool": "query",
  "arguments": {
    "query": `
      DECLARE @return_value int;
      
      EXEC @return_value = [dbo].[GenerateReport]
        @startDate = @start,
        @endDate = @end,
        @format = @reportFormat,
        @userId = @user;
        
      SELECT @return_value as ReturnValue;
    `,
    "params": {
      "start": "2024-01-01",
      "end": "2024-12-31",
      "reportFormat": "PDF",
      "user": 1001
    }
  }
}
```

## Batch Operations

### Bulk Insert with Table-Valued Parameter
```json
{
  "tool": "query",
  "arguments": {
    "query": `
      DECLARE @ProductData ProductTableType;
      
      INSERT INTO @ProductData (Name, Price, Category)
      SELECT Name, Price, Category
      FROM OPENJSON(@products)
      WITH (
        Name nvarchar(100),
        Price decimal(18,2),
        Category nvarchar(50)
      );
      
      INSERT INTO Products (Name, Price, Category)
      SELECT Name, Price, Category
      FROM @ProductData;
    `,
    "params": {
      "products": JSON.stringify([
        { "Name": "Product 1", "Price": 99.99, "Category": "Electronics" },
        { "Name": "Product 2", "Price": 149.99, "Category": "Electronics" }
      ])
    }
  }
}
```

## Advanced Querying

### Hierarchical Data Query
```json
{
  "tool": "query",
  "arguments": {
    "query": `
      WITH CategoryHierarchy AS (
        SELECT 
          CategoryId,
          Name,
          ParentCategoryId,
          0 as Level,
          CAST(Name as nvarchar(255)) as Path
        FROM Categories
        WHERE ParentCategoryId IS NULL
        
        UNION ALL
        
        SELECT 
          c.CategoryId,
          c.Name,
          c.ParentCategoryId,
          ch.Level + 1,
          CAST(ch.Path + ' > ' + c.Name as nvarchar(255))
        FROM Categories c
        INNER JOIN CategoryHierarchy ch ON c.ParentCategoryId = ch.CategoryId
      )
      SELECT * FROM CategoryHierarchy
      ORDER BY Path;
    `
  }
}
```

### Full-Text Search
```json
{
  "tool": "query",
  "arguments": {
    "query": `
      SELECT 
        p.ProductId,
        p.Name,
        p.Description,
        KEY_TBL.RANK as SearchRank
      FROM Products p
      INNER JOIN CONTAINSTABLE(Products, (Name, Description), @searchTerm) AS KEY_TBL
        ON p.ProductId = KEY_TBL.[KEY]
      ORDER BY KEY_TBL.RANK DESC;
    `,
    "params": {
      "searchTerm": "wireless AND (headphone OR earbuds)"
    }
  }
}
```

## Performance Monitoring

### Query Performance Analysis
```json
{
  "tool": "query",
  "arguments": {
    "query": `
      SET STATISTICS IO ON;
      SET STATISTICS TIME ON;
      
      SELECT 
        c.CustomerId,
        c.Name,
        COUNT(o.OrderId) as OrderCount,
        SUM(o.Total) as TotalSpent
      FROM Customers c
      LEFT JOIN Orders o ON c.CustomerId = o.CustomerId
      WHERE o.OrderDate >= @since
      GROUP BY c.CustomerId, c.Name
      HAVING COUNT(o.OrderId) > @minOrders;
      
      SET STATISTICS IO OFF;
      SET STATISTICS TIME OFF;
    `,
    "params": {
      "since": "2024-01-01",
      "minOrders": 5
    }
  }
}
```

## Security Implementations

### Row-Level Security
```json
{
  "tool": "query",
  "arguments": {
    "query": `
      -- Create security policy
      CREATE SECURITY POLICY CustomerFilter
      ADD FILTER PREDICATE dbo.fn_SecurityPredicate(@UserId)
      ON dbo.CustomerData;
      
      -- Apply policy
      ALTER SECURITY POLICY CustomerFilter
      WITH (STATE = ON);
      
      -- Query with security context
      EXECUTE AS USER = @userName;
      SELECT * FROM CustomerData;
      REVERT;
    `,
    "params": {
      "userName": "app_user"
    }
  }
}
```

## Data Integration

### ETL Process
```json
{
  "tool": "query",
  "arguments": {
    "query": `
      -- Stage data
      INSERT INTO StagingCustomers (ExternalId, Data)
      SELECT ExternalId, Data
      FROM OPENROWSET(
        BULK 'customer_data.json',
        SINGLE_CLOB
      ) as JsonData;
      
      -- Transform
      WITH ParsedData AS (
        SELECT 
          ExternalId,
          JSON_VALUE(Data, '$.name') as Name,
          JSON_VALUE(Data, '$.email') as Email,
          JSON_VALUE(Data, '$.address') as Address
        FROM StagingCustomers
      )
      
      -- Load
      MERGE INTO Customers as target
      USING ParsedData as source
      ON target.ExternalId = source.ExternalId
      WHEN MATCHED THEN
        UPDATE SET
          Name = source.Name,
          Email = source.Email,
          Address = source.Address
      WHEN NOT MATCHED THEN
        INSERT (ExternalId, Name, Email, Address)
        VALUES (source.ExternalId, source.Name, source.Email, source.Address);
    `
  }
}
```

## Best Practices

1. **Transaction Management**
   - Use explicit transactions
   - Implement proper error handling
   - Consider isolation levels
   - Keep transactions short

2. **Performance Optimization**
   - Use appropriate indexes
   - Monitor query plans
   - Implement caching strategies
   - Use batch operations

3. **Security**
   - Implement row-level security
   - Use parameterized queries
   - Validate all inputs
   - Audit sensitive operations

4. **Error Handling**
   - Implement comprehensive error handling
   - Log errors appropriately
   - Provide meaningful error messages
   - Handle cleanup in error cases
