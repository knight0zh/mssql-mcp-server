declare module '@modelcontextprotocol/sdk/server/index.js' {
  export class Server {
    constructor(
      info: { name: string; version: string },
      capabilities: { capabilities: { tools: Record<string, unknown> } }
    );
    connect(transport: unknown): Promise<void>;
    setRequestHandler<T extends { params: unknown }>(
      schema: unknown,
      handler: (request: T) => Promise<unknown>
    ): void;
    onerror: (error: unknown) => void;
    close(): Promise<void>;
  }
}

declare module '@modelcontextprotocol/sdk/server/stdio.js' {
  export class StdioServerTransport {
    constructor();
  }
}

declare module '@modelcontextprotocol/sdk/types.js' {
  export class McpError extends Error {
    constructor(code: string, message: string, details?: unknown);
  }

  export const ErrorCode: {
    InvalidRequest: string;
    MethodNotFound: string;
    InternalError: string;
    ConnectionFailed: string;
    AuthenticationFailed: string;
    ResourceNotFound: string;
    PermissionDenied: string;
    Timeout: string;
  };

  export interface ListToolsRequest {
    params: Record<string, never>;
  }

  export interface CallToolRequest {
    params: {
      name: string;
      arguments: Record<string, unknown>;
    };
  }

  export const ListToolsRequestSchema: unknown;
  export const CallToolRequestSchema: unknown;
}
