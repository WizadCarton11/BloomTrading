# Auth Service - Organized Structure

This document describes the organized structure of the authentication service with proper validation and type safety.

## Directory Structure

```
src/
├── index.ts                 # Main server entry point
├── exports.ts              # Main exports for easy imports
├── grpc-server.ts          # gRPC server implementation
├── middleware/             # Request middleware
│   ├── index.ts           # Middleware exports
│   └── auth.middleware.ts # Authentication and validation middleware
├── routes/                 # API route handlers
│   └── auth.ts           # Authentication routes
├── schemas/               # Validation schemas using Zod
│   ├── index.ts          # Schema exports
│   └── auth.schemas.ts   # Authentication validation schemas
├── services/              # Business logic services
│   └── auth-service.ts   # Authentication service implementation
├── types/                 # TypeScript type definitions
│   ├── index.ts          # Type exports
│   └── auth.types.ts     # Authentication type definitions
└── utils/                 # Utility functions
    ├── index.ts          # Utility exports
    └── auth.utils.ts     # Authentication utility functions
```

## Features

### 🔒 Body Validation
- **Zod-based validation**: All request bodies are validated using Zod schemas
- **Comprehensive email validation**: Checks format and ensures it's not empty
- **Strong password requirements**: Minimum 8 characters with uppercase, lowercase, and numbers
- **Name validation**: Allows only letters, spaces, hyphens, and apostrophes
- **Token format validation**: Validates JWT token structure

### 🏗️ Organized Structure
- **Separated concerns**: Types, schemas, middleware, and utilities in dedicated folders
- **Easy imports**: Index files for clean import statements
- **Type safety**: Full TypeScript support with proper interfaces
- **Reusable components**: Middleware and utilities can be reused across routes

### 🛡️ Enhanced Security
- **Input sanitization**: All inputs are validated before processing
- **Error handling**: Comprehensive error handling with appropriate HTTP status codes
- **Token validation**: Robust JWT token validation with proper error messages
- **Sensitive data masking**: Utility functions to mask passwords and tokens in logs

## API Endpoints

### POST /api/auth/register
**Request Body:**
```json
{
  "email": "user@example.com",        // Required: Valid email format
  "password": "SecurePass123",        // Required: Min 8 chars, uppercase, lowercase, number
  "firstName": "John",                // Optional: Letters, spaces, hyphens, apostrophes only
  "lastName": "Doe"                   // Optional: Letters, spaces, hyphens, apostrophes only
}
```

**Validation Rules:**
- Email: Must be valid email format and not empty
- Password: Minimum 8 characters, must contain uppercase, lowercase, and number
- Names: Optional, 1-50 characters, letters/spaces/hyphens/apostrophes only

### POST /api/auth/login
**Request Body:**
```json
{
  "email": "user@example.com",        // Required: Valid email format
  "password": "password123"           // Required: Not empty
}
```

### POST /api/auth/refresh
**Request Body:**
```json
{
  "refreshToken": "jwt.token.here"    // Required: Valid JWT format
}
```

### GET /api/auth/me
**Headers:**
```
Authorization: Bearer jwt.token.here  // Required: Valid JWT format
```

## Error Responses

All validation errors return a structured response:

```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Please enter a valid email address"
    },
    {
      "field": "password",
      "message": "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    }
  ]
}
```

## Usage Examples

### Using the organized imports:

```typescript
// Import types
import { RegisterBody, LoginBody, UserResponse } from './types';

// Import validation schemas
import { registerSchema, loginSchema } from './schemas';

// Import middleware
import { validateBody, authenticateToken } from './middleware';

// Import utilities
import { sanitizeUserData, maskSensitiveData } from './utils';
```

### Using validation middleware:

```typescript
// Register route with validation
fastify.post('/register', {
  preHandler: validateBody(registerSchema)
}, async (request, reply) => {
  // request.body is now validated and typed
  const { email, password, firstName, lastName } = request.body;
  // ... rest of the logic
});
```

## Benefits

1. **Type Safety**: Full TypeScript support with proper interfaces
2. **Input Validation**: Comprehensive validation using Zod schemas
3. **Error Handling**: Consistent error responses with detailed messages
4. **Maintainability**: Organized structure makes code easy to maintain and extend
5. **Reusability**: Middleware and utilities can be reused across different routes
6. **Security**: Enhanced input validation and sanitization
7. **Developer Experience**: Clear error messages and type hints improve DX

## Dependencies Added

- `zod`: For runtime type validation and schema definition

This organized structure provides a solid foundation for the authentication service with proper validation, type safety, and maintainable code organization.
