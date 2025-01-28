#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import type { CallToolRequest, ListToolsRequest } from '@modelcontextprotocol/sdk/types.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import sql from 'mssql';

interface QueryArgs {
  connectionString?: string;
  host?: string;
  port?: number;
  database?: string;
  username?: string;
  password?: string;
  query: string;
  encrypt?: boolean;
  trustServerCertificate?: boolean;
}

const isValidQueryArgs = (args: unknown): args is QueryArgs => {
  const candidate = args as Record<string, unknown>;

  if (typeof candidate !== 'object' || candidate === null) {
    return false;
  }

  // Query is required
  if (typeof candidate.query !== 'string') {
    return false;
  }

  // Either connectionString OR (host + username + password) must be provided
  if (candidate.connectionString !== undefined) {
    if (typeof candidate.connectionString !== 'string') {
      return false;
    }
  } else {
    if (typeof candidate.host !== 'string') {
      return false;
    }
    if (typeof candidate.username !== 'string') {
      return false;
    }
    if (typeof candidate.password !== 'string') {
      return false;
    }
  }

  // Optional parameters
  if (candidate.port !== undefined && typeof candidate.port !== 'number') {
    return false;
  }
  if (candidate.database !== undefined && typeof candidate.database !== 'string') {
    return false;
  }
  if (candidate.encrypt !== undefined && typeof candidate.encrypt !== 'boolean') {
    return false;
  }
  if (
    candidate.trustServerCertificate !== undefined &&
    typeof candidate.trustServerCertificate !== 'boolean'
  ) {
    return false;
  }

  return true;
};

export class MssqlServer {
  private server: Server;
  private pools: Map<string, sql.ConnectionPool>;

  constructor() {
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

    this.pools = new Map();

    this.setupToolHandlers();

    // Error handling
    this.server.onerror = (error): void => console.error('[MCP Error]', error);
    process.on('SIGINT', () => {
      void this.cleanup();
      process.exit(0);
    });
  }

  private async cleanup(): Promise<void> {
    const closePromises = Array.from(this.pools.values()).map((pool) => pool.close());
    await Promise.all(closePromises);
    this.pools.clear();
    await this.server.close();
  }

  private getConnectionConfig(args: QueryArgs): sql.config {
    if (args.connectionString) {
      return {
        server: args.connectionString, // Using server instead of connectionString as per mssql types
      };
    }

    if (!args.host) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        'Host is required when not using connection string'
      );
    }

    return {
      server: args.host,
      port: args.port || 1433,
      database: args.database || 'master',
      user: args.username,
      password: args.password,
      options: {
        encrypt: args.encrypt ?? false,
        trustServerCertificate: args.trustServerCertificate ?? true,
      },
    };
  }

  private async getPool(config: sql.config): Promise<sql.ConnectionPool> {
    const key = JSON.stringify(config);
    let pool = this.pools.get(key);

    if (!pool) {
      pool = new sql.ConnectionPool(config);
      await pool.connect();
      this.pools.set(key, pool);
    }

    return pool;
  }

  async handleQuery(args: QueryArgs): Promise<{ content: Array<{ type: string; text: string }> }> {
    try {
      const config = this.getConnectionConfig(args);
      const pool = await this.getPool(config);
      const result = await pool.request().query(args.query);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result.recordset, null, 2),
          },
        ],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new McpError(ErrorCode.InternalError, `Database error: ${message}`);
    }
  }

  private setupToolHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, (_request: ListToolsRequest) =>
      Promise.resolve({
        tools: [
          {
            name: 'query',
            description: 'Execute a SQL query on a MSSQL database',
            inputSchema: {
              type: 'object',
              properties: {
                connectionString: {
                  type: 'string',
                  description: 'Full connection string (alternative to individual parameters)',
                },
                host: {
                  type: 'string',
                  description: 'Database server hostname',
                },
                port: {
                  type: 'number',
                  description: 'Database server port (default: 1433)',
                },
                database: {
                  type: 'string',
                  description: 'Database name (default: master)',
                },
                username: {
                  type: 'string',
                  description: 'Database username',
                },
                password: {
                  type: 'string',
                  description: 'Database password',
                },
                query: {
                  type: 'string',
                  description: 'SQL query to execute',
                },
                encrypt: {
                  type: 'boolean',
                  description: 'Enable encryption (default: false)',
                },
                trustServerCertificate: {
                  type: 'boolean',
                  description: 'Trust server certificate (default: true)',
                },
              },
              required: ['query'],
              oneOf: [
                { required: ['connectionString'] },
                { required: ['host', 'username', 'password'] },
              ],
            },
          },
        ],
      })
    );

    this.server.setRequestHandler(
      CallToolRequestSchema,
      async (
        request: CallToolRequest
      ): Promise<{ content: Array<{ type: string; text: string }> }> => {
        const params = request.params as { name: string; arguments: unknown };

        if (params.name !== 'query') {
          throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${params.name}`);
        }

        if (!isValidQueryArgs(params.arguments)) {
          throw new McpError(ErrorCode.InvalidRequest, 'Invalid query arguments');
        }

        return this.handleQuery(params.arguments);
      }
    );
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('MSSQL MCP server running on stdio');
  }
}

// Only start the server if this file is being run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new MssqlServer();
  void server.run().catch(console.error);
}
