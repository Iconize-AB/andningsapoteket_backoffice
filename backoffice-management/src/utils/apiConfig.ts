/**
 * API Configuration utility for environment-based endpoint management
 */

const isLocalDevelopment = process.env.NODE_ENV === 'development' || 
  window.location.hostname === 'localhost' || 
  window.location.hostname === '127.0.0.1';

export const API_BASE_URL = isLocalDevelopment 
  ? 'http://localhost:3000'
  : 'https://api.wehale.io';

/**
 * Get the full API URL for a given endpoint
 * @param endpoint - The API endpoint (e.g., '/v1/backoffice/sessions/all')
 * @returns The complete URL
 */
export const getApiUrl = (endpoint: string): string => {
  // Ensure endpoint starts with a slash
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${normalizedEndpoint}`;
};

/**
 * Get the production API URL for a given endpoint
 * This is used for specific cases where we need to force production URLs
 * @param endpoint - The API endpoint
 * @returns The complete production URL
 */
export const getProductionApiUrl = (endpoint: string): string => {
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `https://api.wehale.io${normalizedEndpoint}`;
};


/**
 * Get the appropriate API URL based on the endpoint type
 * Some endpoints (like authentication) should always use production URLs
 * @param endpoint - The API endpoint
 * @param forceProduction - Force using production URL even in development
 * @returns The complete URL
 */
export const getApiUrlForEndpoint = (endpoint: string, forceProduction: boolean = false): string => {
  // Authentication and user management endpoints should always use production
  const productionOnlyEndpoints = [
    '/v1/user/signin',
    '/v1/user/',
    '/v1/backoffice/users/',
    '/v1/statistics/',
    '/v1/organizations/',
    '/v1/backoffice/authors',
    '/v1/backoffice/categories',
    '/v1/backoffice/sub-categories',
    '/v1/backoffice/homescreen/',
    '/v1/challenges/',
  ];

  const shouldUseProduction = forceProduction || 
    productionOnlyEndpoints.some(prodEndpoint => endpoint.includes(prodEndpoint));

  if (shouldUseProduction) {
    return getProductionApiUrl(endpoint);
  }

  return getApiUrl(endpoint);
};

const apiConfig = {
  API_BASE_URL,
  getApiUrl,
  getProductionApiUrl,
};

export default apiConfig;
