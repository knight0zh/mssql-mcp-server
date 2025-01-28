import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import type { DatabaseError } from '../types/index.js';

export function handleError(error: unknown): McpError {
  if (error instanceof McpError) {
    return error;
  }

  const dbError = error as DatabaseError;

  // SQL Server specific error codes
  if (dbError.number) {
    switch (dbError.number) {
      // Login failed
      case 18456:
        return new McpError(ErrorCode.AuthenticationFailed, 'Authentication failed');

      // Database does not exist
      case 4060:
        return new McpError(ErrorCode.ResourceNotFound, 'Database does not exist');

      // Object (table, view, etc.) does not exist
      case 208:
        return new McpError(ErrorCode.ResourceNotFound, 'Object does not exist');

      // Permission denied
      case 229:
      case 230:
        return new McpError(ErrorCode.PermissionDenied, 'Insufficient permissions');

      // Query timeout
      case -2:
        return new McpError(ErrorCode.Timeout, 'Query execution timeout');

      // Connection timeout
      case -1:
        return new McpError(ErrorCode.Timeout, 'Connection timeout');

      // Constraint violation
      case 547:
        return new McpError(
          ErrorCode.InvalidRequest,
          'Operation would violate database constraints'
        );

      // Duplicate key
      case 2601:
      case 2627:
        return new McpError(ErrorCode.InvalidRequest, 'Duplicate key value');

      // Arithmetic overflow
      case 8115:
        return new McpError(ErrorCode.InvalidRequest, 'Arithmetic overflow error');

      // String or binary data would be truncated
      case 8152:
        return new McpError(ErrorCode.InvalidRequest, 'Data would be truncated');

      // Invalid object name
      case 201:
        return new McpError(ErrorCode.InvalidRequest, 'Invalid object name');

      // Invalid column name
      case 207:
        return new McpError(ErrorCode.InvalidRequest, 'Invalid column name');

      // Syntax error
      case 102:
        return new McpError(ErrorCode.InvalidRequest, 'SQL syntax error');
    }
  }

  // Connection errors
  if (dbError.code) {
    switch (dbError.code) {
      case 'ECONNREFUSED':
        return new McpError(ErrorCode.ConnectionFailed, 'Connection refused');

      case 'ETIMEDOUT':
        return new McpError(ErrorCode.Timeout, 'Connection timed out');

      case 'ENOTFOUND':
        return new McpError(ErrorCode.ConnectionFailed, 'Host not found');

      case 'ENETUNREACH':
        return new McpError(ErrorCode.ConnectionFailed, 'Network unreachable');
    }
  }

  // Generic error handling
  const message = dbError.message || 'An unknown error occurred';
  const details = {
    code: dbError.code,
    number: dbError.number,
    state: dbError.state,
    class: dbError.class,
    serverName: dbError.serverName,
    procName: dbError.procName,
    lineNumber: dbError.lineNumber,
  };

  return new McpError(ErrorCode.InternalError, message, details);
}

export function isTransientError(error: unknown): boolean {
  const dbError = error as DatabaseError;

  // SQL Server transient error numbers
  const transientErrors = [
    -2, // Timeout
    701, // Out of memory
    921, // Database has not been recovered yet
    1204, // Lock issue
    1205, // Deadlock victim
    1221, // Resource lock validation
    40143, // Azure SQL connection issue
    40197, // Azure SQL error processing request
    40501, // Azure SQL service busy
    40613, // Azure SQL Database not currently available
  ];

  return (
    transientErrors.includes(dbError.number || 0) ||
    dbError.code === 'ETIMEDOUT' ||
    dbError.code === 'ECONNRESET' ||
    dbError.code === 'EPIPE'
  );
}
