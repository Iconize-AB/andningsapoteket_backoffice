/**
 * Demo script to show API configuration behavior
 * This file can be removed after testing
 */

import { getApiUrl, getApiUrlForEndpoint, API_BASE_URL } from './apiConfig';

console.log('=== API Configuration Demo ===');
console.log('Current API Base URL:', API_BASE_URL);
console.log('Environment:', process.env.NODE_ENV);
console.log('Hostname:', window.location.hostname);

console.log('\n=== Basic API URLs ===');
console.log('Sessions endpoint:', getApiUrl('/v1/backoffice/sessions/all'));
console.log('Logs endpoint:', getApiUrl('/v1/logs'));

console.log('\n=== Endpoint-specific URLs ===');
console.log('User signin (production only):', getApiUrlForEndpoint('/v1/user/signin'));
console.log('User management (production only):', getApiUrlForEndpoint('/v1/backoffice/users/all'));
console.log('Sessions (environment-based):', getApiUrlForEndpoint('/v1/backoffice/sessions/all'));
console.log('Logs (environment-based):', getApiUrlForEndpoint('/v1/logs'));

console.log('\n=== Forced Production ===');
console.log('Logs (forced production):', getApiUrlForEndpoint('/v1/logs', true));

export {};
