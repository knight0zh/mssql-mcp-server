# Contributing to MSSQL MCP Server

We appreciate your interest in contributing to the MSSQL MCP Server project! This document provides guidelines and instructions for contributing.

## Development Setup

1. **Prerequisites**
   - Node.js (v18 or higher)
   - npm (v9 or higher)
   - Access to a Microsoft SQL Server instance for testing

2. **Local Development Environment**
   ```bash
   # Clone the repository
   git clone [repository-url]
   cd mssql-mcp-server

   # Install dependencies
   npm install

   # Create a .env file for local development
   cp .env.example .env
   # Edit .env with your SQL Server credentials
   ```

3. **Build the Project**
   ```bash
   npm run build
   ```

4. **Run Tests**
   ```bash
   npm test
   ```

## Code Style Guidelines

We use ESLint and Prettier to maintain consistent code style:

- TypeScript for all source files
- 2 spaces for indentation
- Single quotes for strings
- Semicolons required
- Maximum line length of 100 characters
- Clear and descriptive variable names
- JSDoc comments for public APIs

Run style checks:
```bash
npm run lint
```

Fix style issues automatically:
```bash
npm run lint:fix
```

## Testing Requirements

- All new features must include unit tests
- Integration tests required for database interactions
- Maintain or improve code coverage
- Test both success and error scenarios
- Mock external dependencies appropriately

Run tests with coverage:
```bash
npm run test:coverage
```

## Pull Request Process

1. **Branch Naming**
   - Feature: `feature/description`
   - Bug fix: `fix/description`
   - Documentation: `docs/description`
   - Performance: `perf/description`

2. **Before Submitting**
   - Update documentation for new features
   - Add/update tests
   - Run linter and fix any issues
   - Ensure all tests pass
   - Update CHANGELOG.md
   - Rebase on latest main branch

3. **PR Description**
   - Clear description of changes
   - Link to related issues
   - List of breaking changes (if any)
   - Screenshots (if UI changes)
   - Steps to test changes

4. **Review Process**
   - At least one maintainer review required
   - Address all review comments
   - Pass CI/CD checks
   - Keep PR scope focused

## Commit Guidelines

Follow conventional commits specification:

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- feat: New feature
- fix: Bug fix
- docs: Documentation changes
- style: Code style changes
- refactor: Code refactoring
- perf: Performance improvements
- test: Adding/updating tests
- chore: Maintenance tasks

Example:
```
feat(query): add support for parameterized queries

- Implement parameter validation
- Add type checking
- Update documentation

Closes #123
```

## Development Best Practices

1. **Error Handling**
   - Use custom error classes
   - Provide meaningful error messages
   - Include context in error responses
   - Log errors appropriately

2. **Security**
   - Validate all inputs
   - Use parameterized queries
   - Follow least privilege principle
   - Keep dependencies updated

3. **Performance**
   - Use connection pooling
   - Optimize database queries
   - Handle resource cleanup
   - Monitor memory usage

4. **Documentation**
   - Keep README.md updated
   - Document all public APIs
   - Include usage examples
   - Update CHANGELOG.md

## Getting Help

- Open an issue for bugs or feature requests
- Join our community chat for questions
- Check existing documentation and issues
- Contact maintainers for guidance

## Code of Conduct

Please note that this project is released with a Contributor Code of Conduct. By participating in this project you agree to abide by its terms.

## License

By contributing to MSSQL MCP Server, you agree that your contributions will be licensed under the MIT License.
