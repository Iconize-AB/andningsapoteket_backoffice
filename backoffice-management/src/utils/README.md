# API Configuration

This utility provides environment-based API endpoint management for the backoffice application.

## Overview

The API configuration automatically switches between local development and production endpoints based on the environment:

- **Local Development**: `http://localhost:3000`
- **Production**: `https://api.wehale.io`

## Usage

### Basic Usage

```typescript
import { getApiUrl } from '../utils/apiConfig';

// Automatically uses the correct base URL based on environment
const response = await fetch(getApiUrl('/v1/backoffice/sessions/all'), {
  headers: { Authorization: `Bearer ${token}` }
});
```

### Endpoint-Specific Configuration

Some endpoints should always use production URLs (like authentication and user management):

```typescript
import { getApiUrlForEndpoint } from '../utils/apiConfig';

// Always uses production URL for authentication
const response = await fetch(getApiUrlForEndpoint('/v1/user/signin'), {
  method: 'POST',
  body: JSON.stringify({ email, password })
});

// Uses environment-based URL for other endpoints
const sessions = await fetch(getApiUrlForEndpoint('/v1/backoffice/sessions/all'));
```

### Force Production URL

You can force any endpoint to use the production URL:

```typescript
import { getApiUrlForEndpoint } from '../utils/apiConfig';

// Forces production URL even in development
const response = await fetch(getApiUrlForEndpoint('/v1/logs', true));
```

## Environment Detection

The configuration detects the environment using:

1. `process.env.NODE_ENV === 'development'`
2. `window.location.hostname === 'localhost'` or `'127.0.0.1'`

## Production-Only Endpoints

The following endpoint patterns always use production URLs:

- `/v1/user/signin`
- `/v1/user/`
- `/v1/backoffice/users/`
- `/v1/statistics/`
- `/v1/organizations/`
- `/v1/backoffice/authors`
- `/v1/backoffice/categories`
- `/v1/backoffice/sub-categories`
- `/v1/backoffice/homescreen/`
- `/v1/challenges/`

## Available Functions

- `getApiUrl(endpoint)` - Returns environment-based URL
- `getApiUrlForEndpoint(endpoint, forceProduction?)` - Returns URL with endpoint-specific logic
- `getLegacyProductionApiUrl(endpoint)` - Returns legacy production URL
- `getProductionApiUrl(endpoint)` - Returns new production URL
- `API_BASE_URL` - Current base URL constant

## Migration

All existing fetch calls have been updated to use these utilities. The old hardcoded URLs have been replaced with the appropriate configuration function calls.

## Testing

Run the demo script to see the configuration in action:

```typescript
import './utils/demo';
```

This will log the current configuration and show example URLs for different scenarios.
