# Agent Guidelines for X API Client

## Commands
- **Test all**: `bun test`
- **Test single file**: `bun test <file>` (e.g., `bun test tests/x-api-client.test.ts`)
- **Run example**: `bun <file>` (e.g., `bun examples/01-basic.ts`)
- No build/lint scripts - TypeScript strict mode enforced via tsconfig.json

## Runtime & Tools
- **Always use Bun** instead of Node.js, npm, pnpm, or vite (per .cursor/rules)
- Use `bun:test` for tests (test, expect, describe from 'bun:test')
- Bun auto-loads .env - don't use dotenv package
- Prefer Bun APIs (`Bun.file`, `Bun.$`) over Node.js equivalents where applicable

## Code Style
- **TypeScript**: Strict mode, noUncheckedIndexedAccess, explicit types for public APIs
- **Imports**: Named imports first, then type imports (`import type { ... }`)
- **Naming**: camelCase (variables/methods), PascalCase (classes), prefix private fields with `_`
- **Classes**: Use `readonly` for immutable properties, inject dependencies via constructor
- **Errors**: Extend XApiError (AuthError, HttpError, MediaUploadError, BinaryNotFoundError) with optional `code` parameter
- **Async**: Always use async/await, handle errors with try-catch
- **Never commit**: Secrets, cookies, tokens, or .env files
