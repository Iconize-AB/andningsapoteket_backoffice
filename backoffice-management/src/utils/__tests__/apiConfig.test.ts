/**
 * Tests for API configuration utility
 */

import { getApiUrl, getApiUrlForEndpoint, getProductionApiUrl } from '../apiConfig';

// Mock process.env and window.location for testing
const mockProcessEnv = (env: any) => {
  const originalEnv = process.env;
  process.env = { ...originalEnv, ...env };
  return () => {
    process.env = originalEnv;
  };
};

const mockWindowLocation = (hostname: string) => {
  const originalLocation = window.location;
  Object.defineProperty(window, 'location', {
    value: { hostname },
    writable: true,
  });
  return () => {
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
    });
  };
};

describe('API Configuration', () => {
  describe('getApiUrl', () => {
    it('should return localhost URL in development', () => {
      const restoreEnv = mockProcessEnv({ NODE_ENV: 'development' });
      const restoreLocation = mockWindowLocation('localhost');
      
      expect(getApiUrl('/v1/test')).toBe('http://localhost:3000/v1/test');
      
      restoreEnv();
      restoreLocation();
    });

    it('should return production URL in production', () => {
      const restoreEnv = mockProcessEnv({ NODE_ENV: 'production' });
      const restoreLocation = mockWindowLocation('api.wehale.io');
      
      expect(getApiUrl('/v1/test')).toBe('https://api.wehale.io/v1/test');
      
      restoreEnv();
      restoreLocation();
    });

    it('should handle localhost hostname in development', () => {
      const restoreEnv = mockProcessEnv({ NODE_ENV: 'production' });
      const restoreLocation = mockWindowLocation('localhost');
      
      expect(getApiUrl('/v1/test')).toBe('http://localhost:3000/v1/test');
      
      restoreEnv();
      restoreLocation();
    });
  });

  describe('getApiUrlForEndpoint', () => {
    it('should use production URL for authentication endpoints', () => {
      const restoreEnv = mockProcessEnv({ NODE_ENV: 'development' });
      const restoreLocation = mockWindowLocation('localhost');
      
      expect(getApiUrlForEndpoint('/v1/user/signin')).toBe('https://api.wehale.io/v1/user/signin');
      expect(getApiUrlForEndpoint('/v1/backoffice/users/all')).toBe('https://api.wehale.io/v1/backoffice/users/all');
      
      restoreEnv();
      restoreLocation();
    });

    it('should use local URL for non-production endpoints in development', () => {
      const restoreEnv = mockProcessEnv({ NODE_ENV: 'development' });
      const restoreLocation = mockWindowLocation('localhost');
      
      expect(getApiUrlForEndpoint('/v1/logs')).toBe('http://localhost:3000/v1/logs');
      expect(getApiUrlForEndpoint('/v1/backoffice/sessions/all')).toBe('http://localhost:3000/v1/backoffice/sessions/all');
      
      restoreEnv();
      restoreLocation();
    });

    it('should force production URL when requested', () => {
      const restoreEnv = mockProcessEnv({ NODE_ENV: 'development' });
      const restoreLocation = mockWindowLocation('localhost');
      
      expect(getApiUrlForEndpoint('/v1/logs', true)).toBe('https://api.wehale.io/v1/logs');
      
      restoreEnv();
      restoreLocation();
    });
  });


  describe('getProductionApiUrl', () => {
    it('should return new production URL', () => {
      expect(getProductionApiUrl('/v1/test')).toBe('https://api.wehale.io/v1/test');
    });
  });
});

