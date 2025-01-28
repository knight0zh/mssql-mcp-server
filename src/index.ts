#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
  CallToolRequest,
} from '@modelcontextprotocol/sdk/types.js';
import { config } from 'dotenv';
import { ConnectionPool, IResult, Request } from 'mssql';
import { validateConfig } from './utils/config.js';
import { createConnectionPool } from './utils/database.js';
import { handleError } from './utils/error.js';
import { validateQueryParams } from './utils/validation.js';
import type { QueryParams, DatabaseConfig } from './types/index.js';

// Load environment variables
config();

class MssqlServer {
  private server: Server;
  private pool: ConnectionPool | null = null;
  private config: DatabaseConfig;

  constructor() {
    // Validate configuration
    this.config = validateConfig(process.env);

    this.server = new Server(
      {
        name: 'mssql-server',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();

    // Error handling
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.cleanup();
      process.exit(0);
    });
  }

  private setupToolHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'query',
          description: 'Execute SQL queries against the database',
          inputSchema: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'SQL query to execute',
              },
              params: {
                type: 'object',
                description: 'Query parameters',
                additionalProperties: true,
              },
              database: {
                type: 'string',
                description: 'Optional database name',
              },
              timeout: {
                type: 'number',
                description: 'Query timeout in milliseconds',
              },
            },
            required: ['query'],
          },
        },
        {
          name: 'list_databases',
          description: 'List available databases',
          inputSchema: {
            type: 'object',
            properties: {
              filter: {
                type: 'string',
                description: 'Optional filter pattern (SQL LIKE syntax)',
              },
            },
          },
        },
        {
          name: 'list_tables',
          description: 'List tables in a database',
          inputSchema: {
            type: 'object',
            properties: {
              database: {
                type: 'string',
                description: 'Database name',
              },
              schema: {
                type: 'string',
                description: 'Optional schema name',
              },
              filter: {
                type: 'string',
                description: 'Optional filter pattern (SQL LIKE syntax)',
              },
            },
            required: ['database'],
          },
        },
        {
          name: 'describe_table',
          description: 'Get detailed table schema information',
          inputSchema: {
            type: 'object',
            properties: {
              database: {
                type: 'string',
                description: 'Database name',
              },
              schema: {
                type: 'string',
                description: 'Schema name',
              },
              table: {
                type: 'string',
                description: 'Table name',
              },
            },
            required: ['database', 'table'],
          },
        },
      ],
    }));

    // Handle tool execution
    this.server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'query': {
            const queryParams = args as unknown as QueryParams;
            if (!queryParams.query) {
              throw new McpError(ErrorCode.InvalidRequest, 'Query parameter is required');
            }
            return await this.executeQuery(queryParams);
          }
          case 'list_databases': {
            const { filter } = args as { filter?: string };
            return await this.listDatabases({ filter });
          }
          case 'list_tables': {
            const { database, schema, filter } = args as {
              database: string;
              schema?: string;
              filter?: string;
            };
            if (!database) {
              throw new McpError(ErrorCode.InvalidRequest, 'Database parameter is required');
            }
            return await this.listTables({ database, schema, filter });
          }
          case 'describe_table': {
            const { database, schema, table } = args as {
              database: string;
              schema?: string;
              table: string;
            };
            if (!database || !table) {
              throw new McpError(
                ErrorCode.InvalidRequest,
                'Database and table parameters are required'
              );
            }
            return await this.describeTable({ database, schema, table });
          }
          default:
            throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
        }
      } catch (error) {
        throw handleError(error);
      }
    });
  }

  private async getPool(): Promise<ConnectionPool> {
    if (!this.pool) {
      this.pool = await createConnectionPool(this.config);
    }
    return this.pool;
  }

  private async executeQuery(params: QueryParams): Promise<{ resultSets: IResult<unknown>[] }> {
    validateQueryParams(params);
    const pool = await this.getPool();

    const request = new Request(pool);
    if (params.params) {
      Object.entries(params.params).forEach(([key, value]) => {
        request.input(key, value);
      });
    }

    // if (params.timeout) {
    //   request timeout = params.timeout;
    // }

    if (params.database) {
      await pool.request().batch(`USE [${params.database}]`);
    }

    const result = await request.query(params.query);
    return { resultSets: [result] };
  }

  private async listDatabases(params: { filter?: string }): Promise<{ databases: unknown[] }> {
    const pool = await this.getPool();
    const request = new Request(pool);

    let query = 'SELECT name, database_id, create_date, state_desc FROM sys.databases';
    if (params.filter) {
      query += ` WHERE name LIKE @filter`;
      request.input('filter', params.filter);
    }

    const result = await request.query(query);
    return { databases: result.recordset };
  }

  private async listTables(params: {
    database: string;
    schema?: string;
    filter?: string;
  }): Promise<{ tables: unknown[] }> {
    const pool = await this.getPool();
    await pool.request().batch(`USE [${params.database}]`);

    const request = new Request(pool);
    let query = `
      SELECT
        t.name,
        s.name as schema_name,
        t.type_desc,
        p.rows as row_count,
        t.create_date,
        t.modify_date
      FROM sys.tables t
      INNER JOIN sys.schemas s ON t.schema_id = s.schema_id
      INNER JOIN sys.partitions p ON t.object_id = p.object_id
      WHERE p.index_id IN (0,1)
    `;

    if (params.schema) {
      query += ` AND s.name = @schema`;
      request.input('schema', params.schema);
    }

    if (params.filter) {
      query += ` AND t.name LIKE @filter`;
      request.input('filter', params.filter);
    }

    const result = await request.query(query);
    return { tables: result.recordset };
  }

  private async describeTable(params: {
    database: string;
    schema?: string;
    table: string;
  }): Promise<{ table: unknown }> {
    const pool = await this.getPool();
    await pool.request().batch(`USE [${params.database}]`);

    const schema = params.schema || 'dbo';
    const request = new Request(pool);

    // Get columns
    const columnsQuery = `
      SELECT
        c.name,
        t.name as type,
        c.is_nullable,
        c.default_object_id,
        c.is_identity,
        c.max_length,
        c.precision,
        c.scale,
        CASE WHEN pk.column_id IS NOT NULL THEN 1 ELSE 0 END as is_primary_key
      FROM sys.columns c
      INNER JOIN sys.types t ON c.user_type_id = t.user_type_id
      LEFT JOIN (
        SELECT ic.column_id
        FROM sys.indexes i
        INNER JOIN sys.index_columns ic ON i.object_id = ic.object_id
        WHERE i.is_primary_key = 1
        AND i.object_id = OBJECT_ID(@tableName)
      ) pk ON c.column_id = pk.column_id
      WHERE c.object_id = OBJECT_ID(@tableName)
    `;

    request.input('tableName', `${schema}.${params.table}`);
    const columns = await request.query(columnsQuery);

    // Get indexes
    const indexesQuery = `
      SELECT
        i.name,
        i.type_desc,
        i.is_unique,
        i.is_primary_key,
        STRING_AGG(c.name, ',') WITHIN GROUP (ORDER BY ic.key_ordinal) as columns
      FROM sys.indexes i
      INNER JOIN sys.index_columns ic ON i.object_id = ic.object_id AND i.index_id = ic.index_id
      INNER JOIN sys.columns c ON ic.object_id = c.object_id AND ic.column_id = c.column_id
      WHERE i.object_id = OBJECT_ID(@tableName)
      GROUP BY i.name, i.type_desc, i.is_unique, i.is_primary_key
    `;

    const indexes = await request.query(indexesQuery);

    // Get foreign keys
    const fksQuery = `
      SELECT
        fk.name,
        OBJECT_SCHEMA_NAME(fk.parent_object_id) as schema_name,
        OBJECT_NAME(fk.parent_object_id) as table_name,
        pc.name as parent_column,
        OBJECT_SCHEMA_NAME(fk.referenced_object_id) as referenced_schema_name,
        OBJECT_NAME(fk.referenced_object_id) as referenced_table_name,
        rc.name as referenced_column
      FROM sys.foreign_keys fk
      INNER JOIN sys.foreign_key_columns fkc ON fk.object_id = fkc.constraint_object_id
      INNER JOIN sys.columns pc ON fkc.parent_object_id = pc.object_id AND fkc.parent_column_id = pc.column_id
      INNER JOIN sys.columns rc ON fkc.referenced_object_id = rc.object_id AND fkc.referenced_column_id = rc.column_id
      WHERE fk.parent_object_id = OBJECT_ID(@tableName)
    `;

    const foreignKeys = await request.query(fksQuery);

    return {
      table: {
        name: params.table,
        schema,
        columns: columns.recordset,
        indexes: indexes.recordset,
        foreignKeys: foreignKeys.recordset,
      },
    };
  }

  private async cleanup(): Promise<void> {
    if (this.pool) {
      await this.pool.close();
      this.pool = null;
    }
  }

  public async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('MSSQL MCP server running on stdio');
  }
}

const server = new MssqlServer();
server.run().catch(console.error);
