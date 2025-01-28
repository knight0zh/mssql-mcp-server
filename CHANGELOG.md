# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2024-01-28

### Added
- Initial release of the MSSQL MCP Server
- Basic query execution functionality
- Database listing capability
- Table listing with schema support
- Table schema description tool
- Connection pooling
- Comprehensive error handling
- Query parameter validation
- Security features:
  - Query sanitization
  - Parameter validation
  - TLS support
  - Connection encryption
- Documentation:
  - API documentation
  - Configuration guide
  - Usage examples
  - Contributing guidelines
- Development tools:
  - TypeScript configuration
  - ESLint and Prettier setup
  - Jest testing framework
  - Docker-based integration tests
  - Build and test scripts

### Security
- Input validation for all query parameters
- Blocking of dangerous SQL commands
- Support for TLS encryption
- Connection pooling with configurable limits
- Environment variable based configuration

## [Unreleased]

### Planned Features
- Query result pagination
- Transaction support
- Stored procedure execution
- Bulk operations
- Schema creation/modification tools
- Database backup/restore tools
- Enhanced monitoring and logging
- Performance optimization tools
- Extended security features:
  - Row-level security
  - Column encryption
  - Audit logging
- Additional documentation:
  - Performance tuning guide
  - Security best practices
  - Troubleshooting guide
