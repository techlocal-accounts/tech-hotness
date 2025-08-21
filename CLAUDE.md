# CLAUDE.md

## Coding Style

- Use strict TypeScript with strict mode enabled
- Target Node.js 20+ for runtime compatibility
- Use pnpm workspaces for dependency management
- Prefer Next.js for new web applications unless otherwise specified
- Follow existing patterns and conventions in the codebase
- Use modern JavaScript/TypeScript features (async/await, optional chaining, etc.)
- Keep functions small and focused on a single responsibility
- Add comprehensive error handling and logging
- Write clean, self-documenting code with minimal comments
- Use ESLint and Prettier for code formatting consistency

## Project Structure

- Follow standard Node.js application structure
- Organize code by feature/domain in the services directory
- Use Express.js patterns for routes and controllers
- Keep business logic in service classes
- Use dependency injection where appropriate

## Testing

- Write comprehensive integration tests
- Use test-driven development when possible
- Ensure all edge cases are covered
- Mock external dependencies appropriately